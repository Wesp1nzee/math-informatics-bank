# Аудит проекта OSNOVA (банк задач по математике и информатике)

Дата: 2026-10-17. Режим: только чтение, изменения в коде не вносились.
Репозиторий: `repo_site_bank`. Всё описанное ниже проверено по фактическим файлам
и рабочему дереву на момент аудита.

> **Дисклеймер о состоянии рабочего дерева.** `backend/` целиком **не добавлен в
> git** (`git ls-files backend` → 0 файлов). Во фронтенде около 60 файлов
> изменены, но не закоммичены (массовое удаление JSDoc-комментариев + незавершённая
> фича тёмной темы: `frontend/src/lib/theme.ts`,
> `frontend/src/components/ui/theme-toggle.tsx`, правки `globals.css` и
> `layout.tsx`). Это значит, что «текущее» состояние бэкенда и темы рискует быть
> потеряно и не проверено ревью/CI. Это отдельный технический риск (см. §10).

---

## 1. Фактический стек

| Слой | Технология | Подтверждение |
| --- | --- | --- |
| Frontend | Next.js **16.4.0** (App Router, Turbopack), React **19.3.0** | `frontend/package.json`, `next.config.ts` |
| Язык | TypeScript (strict) | `tsconfig.json` |
| Стили | Tailwind CSS **4** + `@theme`-токены, Radix UI, CVA, Lucide | `package.json`, `src/app/globals.css` |
| Формулы | KaTeX (рендер на сервере) | `components/ui/math.tsx` |
| Формы | React Hook Form + Zod | `features/tutor-leads/*` |
| Аналитика | Яндекс Метрика (тонкий фасад, включается только при `NEXT_PUBLIC_YM_ID`) | `lib/analytics/*` |
| Тесты | Vitest + RTL; Playwright (desktop + mobile) | `vitest.config.mts`, `playwright.config.ts` |
| Пакеты | pnpm 10 | `packageManager` |
| Backend | FastAPI + Pydantic v2 + SQLAlchemy 2 (async) + Alembic | `backend/pyproject.toml` |
| БД | PostgreSQL 17 (прод) / SQLite (тесты) | `compose.yaml`, `tests/conftest.py` |
| Python | **3.14+** (`requires-python = ">=3.14"`) | `pyproject.toml`, `Dockerfile` |
| Auth | Серверные сессии + HttpOnly cookie (НЕ JWT), scrypt-хэш пароля | `app/core/security.py`, `app/domains/sessions/*` |
| CI | **отсутствует** (`.github/` нет) | — |

**Запуск** (из документации, проверено по файлам):
фронтенд `cd frontend && pnpm install && pnpm dev`; бэкенд
`cd backend && uv sync && uv run alembic upgrade head && uv run python -m scripts.seed && uv run python main.py`.
Тесты бэкенда проходят локально: `uv run pytest` → **9 passed**.

---

## 2. Структура репозитория

```
repo_site_bank/
├── frontend/        # Next.js приложение (единственный закоммиченный код)
│   ├── docs/        # architecture.md, migration-plan.md, next-steps.md
│   ├── src/app/     # маршруты ((public)/…), robots, sitemap, layout, 404, error
│   ├── src/features # home, tasks, articles, topics, tutor-leads, diagnostics
│   ├── src/components, src/lib
│   └── tests/e2e
├── backend/         # FastAPI (НЕ в git). app/, migrations/, scripts/, tests/
├── ideal.html       # исходный HTML-прототип (дизайн-референс)
├── README.md        # обновлён под наличие backend (изменение не закоммичено)
└── docs/            # создан этим аудитом
```

Документация, которая **есть**: `README.md`, `frontend/README.md`,
`frontend/docs/architecture.md`, `frontend/docs/migration-plan.md`,
`frontend/docs/next-steps.md`, `backend/README.md`,
`frontend/src/lib/api/generated/README.md`, `frontend/AGENTS.md`.

---

## 3. Backend: фактическое состояние

### 3.1 Домены и модели (SQLAlchemy 2, `app/domains/*/models.py`)

| Таблица | Домен | Назначение | Ключевые поля |
| --- | --- | --- | --- |
| `subjects` | subjects | Предметы (математика/информатика) | `slug` (uniq), `label`, `position` |
| `topics` | topics | Темы внутри предмета | `slug` (uniq), `label`, `subject_id` FK, `position` |
| `tasks` | tasks | Задачи | `title`, `subject_id`, `level` (enum), `minutes`, `summary`, JSON `statement`/`answer`/`steps`, `featured`, `is_published`, `source_ref` |
| `task_topics` | tasks | M2M задача↔тема | PK(task_id, topic_id) |
| `articles` | articles | Статьи | `slug` (uniq), `title`, `description`, `subject_id`, `exam`, `reading_minutes`, JSON `blocks`, `is_published`, `published_on` |
| `tutor_leads` | leads | Заявки | `contact` (index), `exam`/`subject`/`status` (enum), `message`, `consent`, `source`, `ip_hash` |
| `users` | users | Пользователи | `id` UUID, `email` (uniq), `hashed_password`, `role`, `is_active` |
| `user_sessions` | sessions | Серверные сессии | `token_hash` (uniq), `user_id`, `expires_at`, `user_agent`, `ip_hash` |
| `solution_attempts` | solutions | Попытки ответа | `task_id`, `user_id?`, `answer_value`, `outcome` (enum) |
| `user_progress` | progress | Агрегат прогресса | UNIQUE(`user_id`,`task_id`), `attempts`, `correct_attempts`, `solved` |

Миграция одна — `migrations/versions/32b21a07d4ef_initial_schema.py`
(initial schema, `down_revision = None`). Схема в миграции совпадает с моделями.

### 3.2 API-контракт (фактический, `app/api/router.py` + `app/api/v1/router.py`)

Префикс: `api_prefix = "/api"`, затем `/v1`.

| Метод и путь | Авторизация | Замечания |
| --- | --- | --- |
| `GET /api/health` | — | ping БД |
| `GET /api/v1/subjects` | — | список |
| `GET /api/v1/topics?subject=` | — | список |
| `GET /api/v1/tasks?subject&level&featured&page&page_size` | — | пагинация + фильтры, `is_published` |
| `GET /api/v1/tasks/{id}` | — | 404 через `NotFoundError` |
| `GET /api/v1/tasks/{id}/related?limit` | — | `{ items: [...] }` |
| `POST /api/v1/tasks/{id}/check` | опц. cookie | нормализация ответа, пишет `solution_attempts` + `user_progress` |
| `GET /api/v1/articles?subject=` | — | без пагинации |
| `GET /api/v1/articles/{slug}` | — | 404 |
| `POST /api/v1/tutor-leads` | — | honeypot `website`, rate-limit по `contact` |
| `GET /api/v1/tutor-leads?status=` | **admin** | список заявок |
| `POST /api/v1/auth/register` | — | создаёт `student`, ставит cookie |
| `POST /api/v1/auth/login` | — | ставит cookie |
| `POST /api/v1/auth/logout` | cookie | ревокация сессии + очистка cookie |
| `GET /api/v1/users/me` | cookie | текущий пользователь |
| `GET /api/v1/progress` | cookie | прогресс пользователя |

**Единый конверт ошибок**: `{"error": {"code", "message", "details"}}`
(`app/core/exceptions.py`): обрабатываются `AppError`, `RequestValidationError`
(422), `StarletteHTTPException`, `IntegrityError` (409) и общий `Exception` (500).
Это соответствует тому, что парсит фронтенд (`lib/api/errors.ts`).

### 3.3 Бизнес-логика

- **Проверка ответа** (`app/domains/solutions/service.py`): нормализация числа
  (`3,50`→`3.5`, trailing zeros), текст — lower/whitespace. Пишет попытку и,
  если пользователь известен, обновляет `user_progress` (upsert).
- **Похожие задачи** (`tasks/service.py::get_related_tasks`): грузит до 500
  кандидатов и **ранжирует в Python** по совпадению тем/предмета/сложности.
- **Заявки** (`leads/service.py`): honeypot (`website`) → тихий «успех» без записи;
  rate-limit = число заявок с тем же `contact` за час (`LEAD_RATE_LIMIT_PER_HOUR`,
  по умолчанию 5); при превышении `RateLimitedError` (429).
- **Сессии** (`sessions/service.py`): хранится только SHA-256 токена; проверка
  срока, `last_used_at`; cookie: `HttpOnly`, `Secure` (авто в prod),
  `SameSite` из конфига.
- **Регистрация/вход** (`users/service.py`): e-mail в lowercase, scrypt-хэш,
  проверка активности; при ошибке — `UnauthorizedError`.

### 3.4 Безопасность — факты

Реализовано хорошо: scrypt + соль, `hmac.compare_digest`, opaque-токены,
только хэш токена в БД, HttpOnly/Secure/SameSite cookie, разделение ролей
(`require_admin`), honeypot, rate-limit, единый конверт ошибок, экранирование
Pydantic-валидацией.

Проблемы/риски (см. также §10):
1. **`ip_hash` не является хэшем IP.** `leads/service.py` пишет
   `ip_hash=generate_token(16)` — случайный токен, а не `sha256(ip)`. Название
   вводит в заблуждение; поле непригодно для антифрода/дедупликации, а сам IP из
   заявки фактически не сохраняется (нет анализа и нет IP-рейт-лимита).
2. **Rate-limit только по `contact`.** Разные контакты = неограниченное число
   заявок; брутфорс/спам не ограничен по IP (его и не хранят).
3. **CORS: `allow_methods=["*"]`, `allow_headers=["*"]` вместе с
   `allow_credentials=True`** (`app/main.py`). Origins — явный список (это ок),
   но методы/заголовки стоит сузить до `GET/POST` и `Content-Type/Accept`.
4. **CSRF.** Для same-site cookie `lax` покрывает базовый сценарий, но при
   кросс-доменном API (`SameSite=None`) CSRF-токена нет. Документация это
   фиксирует как обязательное требование — в коде отсутствует.
5. **Нет security-заголовков** на фронтенде (`next.config.ts` пуст по части
   CSP/HSTS/Referrer-Policy).
6. **`allowed_hosts` объявлен, но `TrustedHostMiddleware` не подключён** —
   настройка «мёртвая». Аналогично `storage_backend`/S3-настройки не используются.
7. **Нет пути создания администратора** через API (register всегда `student`).

---

## 4. Что уже есть в БД и чего действительно не хватает

**Реализовано:** предметы, темы, задачи (+связь с темами), статьи, попытки
решения, агрегированный прогресс, пользователи, сессии, заявки.

**Отсутствует (для заявленного продукта):**

| Сущность/область | Зачем | Статус |
| --- | --- | --- |
| Диагностика (попытка/результат/темы) | `/diagnostika` — лид-магнит, но результатов на сервере нет | **нет** (всё в браузере) |
| Обновление заявки (PATCH: статус, заметки, ответственный) | сейчас можно только читать заявки, нельзя обработать | **нет** |
| Уведомление о заявке (email/Telegram/outbox) | заявка сохраняется, но преподаватель не узнаёт | **нет** |
| Черновики/публикация контента, авторство | задачи/статьи заводятся только через seed | **нет** |
| SEO-поля контента (`meta_title`, `meta_description`, `canonical`, `noindex`, `og_image`) | у `articles` только `title`/`description`, у `tasks` SEO-полей нет | **нет** |
| Подборки/коллекции (теги, «Задачи ЕГЭ по производной») | будущие SEO-лендинги | **нет** |
| Цены, отзывы, FAQ | лежат в коде фронтенда (`tutor-leads/content.ts`), не в БД | в коде, не в БД |
| Контент хабов `/matematika`, `/informatika` | в коде (`topics/content.ts`), не в БД | в коде |
| Сброс пароля / подтверждение e-mail / токены | стандартный набор auth | **нет** |
| Медиа/загрузки | настройки S3/local есть, фичи нет | **нет** |

---

## 5. Карта фронтенд-маршрутов и источников данных

| Маршрут | Файл | Рендер | Источник данных |
| --- | --- | --- | --- |
| `/` | `app/(public)/page.tsx` | SSG | `features/home/*` + фикстуры задач/статей |
| `/zadachi` | `app/(public)/zadachi/page.tsx` | SSR (searchParams) | `getTasks()` → API или фикстуры |
| `/zadachi/[id]` (+OG) | `app/(public)/zadachi/[id]/page.tsx` | SSG + `generateStaticParams` | `getTaskById()` |
| `/articles` | `app/(public)/articles/page.tsx` | SSG | `getArticles()` |
| `/articles/[slug]` (+OG) | `app/(public)/articles/[slug]/page.tsx` | SSG | `getArticleBySlug()` |
| `/matematika`, `/informatika` | `…/matematika/page.tsx`, `…/informatika/page.tsx` | SSG | `SubjectHub` → `getTasks`/`getArticlesBySubject` + `topics/content.ts` |
| `/podgotovka` | `app/(public)/podgotovka/page.tsx` | SSG | `tutor-leads/content.ts` + форма |
| `/diagnostika` | `app/(public)/diagnostika/page.tsx` | SSG | `features/diagnostics/fixtures.ts` (10 пунктов, всё клиентское) |
| 404 | `app/not-found.tsx` | — | — |
| error | `app/(public)/error.tsx` | client | — |
| `/robots.txt`, `/sitemap.xml`, `/icon.svg` | `app/robots.ts`, `app/sitemap.ts`, `app/icon.svg` | — | константы + фикстуры |

**Компоненты (карта):**
- `components/layout/`: `container`, `section`, `page-hero`, `site-header`,
  `mobile-nav`, `site-footer`.
- `components/ui/`: `button`, `badge`, `input`, `textarea`, `label`, `math`
  (KaTeX на сервере), `rich-text`, `state-message`, `demo-notice`,
  `scroll-reveal`, `theme-toggle` (новый, тёмная тема).
- `components/seo/`: `breadcrumbs`, `json-ld`.
- `features/home/`: 8 секций главной + `task-quiz`, `code-demo`,
  `derivative-graph/viz`, `about-illustration`.
- `features/tasks/`: `task-list/card/statement/filters`, `answer-form`,
  `solution-steps`, `pagination`, `difficulty-meter`, `related-tasks`.
- `features/articles/`: `article-card/body/meta/toc`, `related-articles`.
- `features/topics/`: `subject-hub`.
- `features/tutor-leads/`: `lead-form`, `tutor-lead-panel`, `tutor-cta`,
  `sticky-cta`, `tutor-profile`, `pricing`, `reviews`, `faq`, `tutoring-facts`.
- `features/diagnostics/`: `diagnostics-runner` + `scoring`.

**Источник данных:** единая точка переключения — `isServerApiConfigured()`
(`lib/api/server.ts`, env `API_BASE_URL`) и `isPublicApiConfigured()`
(`lib/api/config.ts`, env `NEXT_PUBLIC_API_BASE_URL`). Пока env пуст — работают
локальные фикстуры (6 задач, 3 статьи, 10 диагностических пунктов), помеченные
`isDemo: true`.

---

## 6. Формы заявок: куда фактически уходят данные

Точка входа — `features/tutor-leads/api.ts::submitTutorLead`, приоритет веток:

1. **Если задан `NEXT_PUBLIC_API_BASE_URL`** → `clientRequest("POST /tutor-leads")`
   с `credentials: "include"`. Заявка сохраняется в таблицу `tutor_leads`.
2. Иначе, **если задан `NEXT_PUBLIC_TUTOR_TELEGRAM`** → открывается Telegram
   (`window.location.assign`) с готовым текстом.
3. Иначе, **если задан `NEXT_PUBLIC_TUTOR_EMAIL`** → открывается `mailto:`.
4. Иначе (и в prod) форма **скрыта** (`tutor-lead-panel.tsx`): без контактов/API
   панель не рендерится.

Важные факты и расхождения:
- **Заявка никого не уведомляет.** При API-ветке запись просто попадает в БД;
  email/Telegram-уведомления, webhook и админ-интерфейса чтения нет. Прочитать
  можно только `GET /api/v1/tutor-leads` под админом (а админа через API не создать).
- Frontend-схема (`schema.ts`) ограничивает `contact` 120 символами, `message`
  1000, `name` 80; backend — 256/4000/128. Расхождения мягкие, но контракт не единый.
- **Honeypot `website` есть на бэкенде, но фронтенд его не отправляет** — ловушка
  фактически никогда не срабатывает.
- `consent` на фронте проверяется Zod-ом, а в `toInput()` жёстко ставится `true`;
  бэкенд принимает только `Literal[True]`. Юридически: **страницы политики
  персональных данных нет**, чекбокс согласия не ссылается на документ.

---

## 7. SEO-план, отчёты с ключевыми словами, списки P0/P1

**Их в репозитории нет.** Поиск по всем `.md`, а также `csv/xlsx/txt/json`
(вне `node_modules/.venv`) не нашёл:
- семантического ядра / отчёта с ключевыми словами;
- списка страниц P0/P1 и приоритизации;
- отдельного SEO-плана или карты контента.

Единственные близкие по смыслу материалы:
- `frontend/docs/next-steps.md` §3.7 «Контентные улучшения SEO» — общие пожелания
  (подборки, перелинковка), без ключей и приоритетов;
- `frontend/docs/architecture.md` §6 — техническая SEO-инфраструктура.

Это ключевой пробел: без семантики и приоритетов невозможно решить, какие
страницы делать первыми (см. §11).

---

## 8. Готовность страниц и функций

### Готово
- Главная (все 8 секций прототипа, включая интерактив).
- Каталог `/zadachi` (фильтры, пагинация по 4, URL-состояние, skeleton, пустые
  состояния), страница задачи с проверкой ответа и раскрытием решения.
- Статьи: список и страница с оглавлением, метаданными, JSON-LD.
- Тематические хабы `/matematika`, `/informatika`.
- `/podgotovka`: описание, факты, FAQ, цены/отзывы (условно), форма заявки.
- SEO-инфраструктура: metadata/canonical, robots, sitemap, JSON-LD
  (WebSite/BreadcrumbList/Article/LearningResource/Person/Service/FAQPage),
  динамические OG-картинки для задач и статей, корректный 404.
- Backend: CRUD-чтение задач/статей/предметов/тем, проверка ответа, заявки,
  auth (register/login/logout/me), прогресс, миграции, seed, 9 тестов.
- Прогрессивное улучшение (работа без JS), тёмная тема (в рабочем дереве).

### Частично
- **Диагностика** `/diagnostika`: механика и отчёт есть, но набор
  демонстрационный и **результат не сохраняется/не отправляется**.
- **Форма заявки**: доставка зависит от env; при API — просто запись в БД без
  уведомления и без обработки статуса.
- **Интеграция фронт↔бэк**: есть слой и типы, но контракт эндпоинтов не
  согласован по префиксу (см. §10.1), а проверка ответа на странице задачи
  **не вызывает бэкенд** (§10.3).
- **Тёмная тема**: код есть, но не закоммичен; `next-steps.md` при этом всё ещё
  описывает «тёмная тема следует prefers-color-scheme» как единственный режим.
- Контент: только 6 задач / 3 статьи в фикстурах и 3 задачи / 2 статьи в seed.

### Отсутствует
- Админ-интерфейс (список/обработка заявок, управление контентом) — нет ни
  маршрутов `(app)`, ни страницы входа.
- Уведомления о заявках, юридические тексты (политика ПД), `apple-icon`/manifest,
  статическая OG-картинка 1200×630 (`frontend/public/og/` — **пустой каталог**),
  security-заголовки, CI, поиск по банку, личный кабинет/тренажёр.

---

## 9. Дублирование функциональности и SEO-конфликты

### Дублирование
1. **Две независимые проверки ответа.** Backend
   (`solutions/service.py::normalize_answer`) и frontend
   (`lib/utils/check-answer.ts`). Логика **различается**: фронт убирает `.0+$` и
   ведущие нули, бэк использует `float`. При расхождении поведения «локальный
   демо-режим» и «API-режим» будут проверять по-разному.
2. **Два источника задач/статей**: фикстуры и API. Плюс `isDemo`-флаги. Это
   осознанно, но требует держать обе модели в синхроне (`features/*/types.ts`).
3. **Два пути доставки заявки** (API vs Telegram/e-mail) — осознанно, но
   сообщения об успехе и семантика различаются.
4. **SEO/metadata**: `buildMetadata()` + отдельные `opengraph-image.tsx` для
   задач и статей. Технически не дублирование, но два механизма OG.
5. Мёртвый код на бэке: `AttemptRead`, `TaskDetailRead`, `TaskRelatedRead`,
   `Message`, `ErrorResponse`, `mask_secret`, `revoke_all_sessions` — объявлены,
   нигде не используются (потенциальный источник путаницы).

### Потенциальные SEO-конфликты
1. **Каннибализация хаба и каталога.** `/matematika` и `/zadachi?subject=matematika`
   показывают одни и те же задачи. Фильтры каталога канонизируются на `/zadachi`,
   т.е. для БЯ обе страницы могут конкурировать по запросу «задачи по математике».
   Нужен явный выбор: хаб — «человеческая» страница предмета, каталог — с фильтрами;
   прописать различие в текстах/интентах.
2. **`lastModified` в sitemap = дата сборки для всех URL** (`BUILD_DATE`),
   одинаково для всего — поисковики могут игнорировать `lastmod`. Стоит брать
   реальные даты `published_on`/`updated_on` из API.
3. **Sitemap не видит контент из API.** `getTaskIdList()`/`getArticleSlugList()`
   (`features/*/api.ts`) читают **только фикстуры**. При включённом `API_BASE_URL`
   sitemap по-прежнему перечисляет 6 демо-задач и 3 демо-статьи → новые записи
   из БД в sitemap не попадут.
4. **Ответ задачи утекает в HTML.** `TaskRead.answer.value` приходит из API, а
   страница передаёт `expected` в клиентский `AnswerForm` — правильный ответ
   виден в исходнике. Для «банка с решениями» это норма, но стоит осознанно
   решить (сейчас решение и так показывается по кнопке).
5. `robots.txt` запрещает `/api/` — верно; отдельных «черновых»/служебных страниц
   (кроме 404/noIndex) нет.

---

## 10. Технические риски (по важности)

1. **[Высокий] Расхождение контракта API по префиксу.** Фронтенд вызывает
   пути без префикса: `serverRequest("/tasks")`, `clientRequest("/tutor-leads")`.
   Бэкенд отдаёт их под `/api/v1/…` (`/api/v1/tasks`, `/api/v1/tutor-leads`).
   При этом `frontend/docs/next-steps.md` §2.3 прямо советует
   `API_BASE_URL=http://localhost:8000` и `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`.
   С этим значением запросы уйдут на `http://localhost:8000/tasks` и получат 404.
   Нужно либо задавать base как `…/api/v1`, либо (надёжнее) добавить префикс в
   `lib/api/*` и убрать двусмысленность в документации.
2. **[Высокий] Незакоммиченные изменения.** Весь `backend/` не в git; фронтенд
   содержит ~60 изменённых файлов (удаление комментариев + тёмная тема) без
   коммита. Нет CI. Риск потери и попадания «мусорного» diff в историю.
3. **[Высокий] Интерактив не использует бэкенд.** `AnswerForm` проверяет ответ
   локально (`lib/utils/check-answer.ts`) и **не вызывает** `POST /tasks/{id}/check`.
   Результат: `solution_attempts` и `user_progress` никогда не наполняются из UI,
   `/progress` бесполезен, дублируется логика проверки.
4. **[Средний] Заявки «в никуда».** Нет уведомления и нет админ-поверхности;
   создать админа через API нельзя. В комбинации с отсутствием юридической
   страницы это блокирует реальный приём заявок (главная цель сайта).
5. **[Средний] `ip_hash` — случайный токен** (не хэш IP) + rate-limit только по
   `contact`. Антиспам неполноценен.
6. **[Средний] CORS со `*` для методов/заголовков** + credentials; отсутствует
   CSRF-токен для кросс-сайтовых cookie.
7. **[Средний] Отсутствуют security-заголовки** (CSP/HSTS/Referrer-Policy).
8. **[Средний] Пустой `frontend/public/`** (og/icons/images — каталоги без
   файлов): нет статической OG 1200×630, `apple-icon`, manifest.
9. **[Средний] `get_related_tasks` и отсутствие индексов.** Ранжирование в Python
   по 500 кандидатам и отсутствие индексов на `tasks.level/subject_id/featured/
   is_published` — деградация при росте банка.
10. **[Низкий] Мёртвая конфигурация**: `allowed_hosts` (без `TrustedHostMiddleware`),
    `storage_backend`/S3. Вводит в заблуждение.
11. **[Низкий] Python 3.14-only синтаксис** `except ValueError, TypeError:`
    (PEP 758). Валиден для 3.14 (проверено компиляцией), но требует именно 3.14
    — это жёстко зафиксировано в `pyproject.toml` и `Dockerfile` (приемлемо, но
    стоит знать).
12. **[Низкий] Документация рассинхронизирована.** `next-steps.md` описывает
    тёмную тему как только `prefers-color-scheme` и перечисляет бэкенд как «не
    реализован» вразрез с `README.md`/`architecture.md` (после добавления
    `backend/` и темы). `architecture.md` не упоминает `/diagnostika`,
    `theme-toggle`, `lib/theme.ts`.
13. **[Низкий] `subject-hub` показывает максимум 4 задачи** (`getTasks` с
    `TASK_PAGE_SIZE = 4`, затем `.slice(0, 6)`), хотя в копирайте заявлено больше.

---

## 11. Необходимые изменения и рекомендуемый порядок реализации

Порядок выстроен так, чтобы сначала закрыть блокеры запуска и целостность, затем
SEO-фундамент, затем развитие. **Сейчас ничего из этого не реализовано** — это
план, а не отчёт о работе.

### Фаза 0 — Целостность и запуск (блокеры)
1. Закоммитить `backend/`, тёмную тему и разобрать «комментарийный» diff
   (отдельным коммитом), чтобы история была читаемой. Добавить CI
   (lint/typecheck/tests для frontend и backend).
2. Свести контракт API: договориться о префиксе (`/api/v1`) и убрать
   двусмысленность в `.env.example`/`next-steps.md`; проверить сквозной запуск
   фронт+бэк (каталог, задача, заявка).
3. Юридический минимум: страница политики обработки ПД + ссылка из чекбокса
   согласия.
4. Security-заголовки (CSP/HSTS/Referrer-Policy), сузить CORS
   (`methods=["GET","POST"]`, конкретные заголовки), по желанию — CSRF при
   кросс-сайте.

### Фаза 1 — Рабочий приём заявок (главная цель)
5. Уведомления о заявке (email/Telegram/webhook) и/или минимальная админка:
   список + смена статуса (`PATCH /tutor-leads/{id}`), безопасный способ создать
   администратора.
6. Починить `ip_hash` (реальный `sha256(ip)`, с солью) и добавить IP-рейт-лимит.

### Фаза 2 — SEO-фундамент и семантика
7. **Создать отсутствующий SEO-план**: семантическое ядро, кластеры, список
   страниц P0/P1 с приоритетами и интентами (сейчас этого нет вообще).
8. Sitemap из API: реальные id/slug и `lastModified` из `published_on/updated_on`;
   не только фикстуры.
9. Развести интенты `/matematika` vs `/zadachi?subject=…`; добавить
   SEO-поля контента в БД (`meta_title`/`meta_description`/`canonical`/`noindex`).
10. Статические OG/favicon/manifest (`frontend/public/og`, `apple-icon`).

### Фаза 3 — Единая логика и продукт
11. Убрать дублирование проверки ответа: либо фронт ходит в
    `POST /tasks/{id}/check`, либо backend-нормализация становится единственной.
    Только после этого наполняются `solution_attempts`/`user_progress`.
12. Диагностика на реальных задачах банка + сохранение результата и привязка к
    заявке (`/diagnostika` → лид с контекстом слабых тем).
13. Расширить контент (задачи/статьи) и подборки; вынести цены/отзывы/FAQ из
    кода в БД или CMS.
14. Производительность банка: индексы `tasks`, SQL-ранжирование related,
    переход на `dynamicParams`/ISR по мере роста.

---

## 12. Краткая сводка

- **Стек:** Next.js 16 + React 19 + Tailwind 4 (frontend); FastAPI + SQLAlchemy 2
  + Alembic + PostgreSQL/SQLite (backend); auth — серверные сессии + HttpOnly cookie.
- **Frontend:** публичные страницы, каталог, задачи, статьи, хабы, `/podgotovka`,
  `/diagnostika`, SEO-инфраструктура, тёмная тема — реализованы; данные
  переключаются с фикстур на API по env.
- **Backend:** 10 таблиц, ~16 эндпоинтов, проверка ответа, заявки, auth, прогресс;
  `pytest` → 9 passed. Но `backend/` **не в git**.
- **Формы заявок:** API (запись в БД) → Telegram → e-mail, иначе форма скрыта;
  уведомлений и админки нет; юридической страницы нет.
- **SEO-план/ключи/P0–P1:** в репозитории **отсутствуют** — это главный
  документальный пробел.
- **Ключевые риски:** mismatch префикса API `/api/v1`, незакоммиченные backend и
  тема, интерактив в обход бэкенда, заявки без уведомлений/статусов,
  `ip_hash`-баг, CORS `*`, нет security-заголовков, пустой `public/`.
- **Дублирование:** две независимые проверки ответа (расходятся по поведению);
  два источника контента (фикстуры/API).
- **Изменения не вносились** — создан только этот отчёт.
