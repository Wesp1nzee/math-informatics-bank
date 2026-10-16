# Архитектурный аудит OSNOVA (независимая проверка)

Дата: 2026-10-17. Режим: только чтение. Ни код, ни БД, ни миграции, ни конфигурация
не менялись; git-состояние не изменялось. Каждый вывод предыдущего аудита
перепроверен по исходникам. Что именно запускалось: `uv run pytest` в `backend/`
→ **9 passed**. Frontend-тесты и production-сборку в этом аудите **не запускал**
(в `frontend/node_modules` присутствует, сборка/тесты не выполнялись).

---

## 0. Что подтвердилось, что уточнено, что опровергнуто

| Утверждение предыдущего аудита | Вердикт |
| --- | --- |
| `backend/` не отслеживается Git | ✅ Подтверждено: `git ls-files backend` = 0, `git status` → `?? backend/` |
| «backend не отслеживается из-за ignore» (неявно) | ⚠️ Уточнено: **никакого ignore-правила на `backend/` нет**. `git check-ignore backend` → не игнорируется. Не отслеживается просто потому, что не был `git add`. Игнорируется только `backend/.venv/` |
| Рабочее дерево «грязное», ~60 файлов | ✅ Подтверждено: 60 modified + 5 untracked |
| «Массовое удаление JSDoc-комментариев» | ✅ Подтверждено: **53 файла с 0 добавлений** (чистое удаление комментариев) |
| Тёмная тема незакоммичена | ✅ Подтверждено: `lib/theme.ts`, `theme-toggle.tsx` untracked; правки `globals.css` (+74), `layout.tsx` (+7), `mobile-nav.tsx` (+6) |
| Mismatch префикса API `/api/v1` | ✅ Подтверждено (детали в §2) |
| `ip_hash` = случайный токен, не хэш IP | ✅ Подтверждено: `leads/service.py:44` → `ip_hash=generate_token(16)` |
| Контракт фронт↔бэк «рассогласован» | ⚠️ **Уточнено/частично опровергнуто**: поля ответов **согласованы** (`examLabel`, `readingMinutes`, `isDemo`, `id` как строка). Рассогласован **только base-URL** (префикс). Детали в §2.3 |
| Проверка ответа не вызывает бэкенд | ✅ Подтверждено: `AnswerForm` использует `lib/utils/check-answer.ts`, `POST /tasks/{id}/check` из UI не вызывается |
| Sitemap не видит контент из API | ✅ Подтверждено: `getTaskIdList()`/`getArticleSlugList()` читают только фикстуры |
| Нет SEO-плана / P0–P1 | ✅ Подтверждено: в репозитории нет семантики и приоритизации |

**Новые факты, не отмеченные в предыдущем аудите (важно):**
- **Нет git-remote** (`git remote -v` пуст). Репозиторий существует только локально,
  то есть **внешней копии/бэкапа нет вообще**. Это главный риск сохранности.
- Бэкенд-README упоминает `JWT_SECRET` (строка 18), но JWT в проекте нет —
  авторизация на серверных сессиях. Это устаревшая строка документации.
- `docs/implementation-plan.md` **не существует** — создаётся этим планом.
- `frontend/public/` пуст (каталоги `og/`, `icons/`, `images/` без файлов);
  favicon есть только `src/app/icon.svg`.
- В `frontend/src/app` нет `route.ts`/`middleware.ts`/вложенной группы `(app)` —
  единственный «api» — `src/lib/api` (транспортный слой).

---

## 1. Git и сохранность проекта

### Факты
- Ветка `master`, HEAD = `e3bb95b`, upstream отсутствует, remote отсутствует.
- `backend/`, `docs/`, `.vscode/`, `lib/theme.ts`, `theme-toggle.tsx` — untracked.
- Рабочее дерево = **смесь трёх независимых работ**:
  1. **Новый backend** (полностью, ~60 файлов) — untracked;
  2. **Тёмная тема + переписанная иллюстрация + включение Яндекс.Метрики** —
     `theme.ts`/`theme-toggle.tsx` (untracked) + правки `globals.css`, `layout.tsx`,
     `mobile-nav.tsx`, `about-illustration.tsx` (+303/−54, переписана на
     анимированный «unit circle → sine», стала `"use client"`);
  3. **Чистое удаление JSDoc-комментариев** в 53 файлах (0 добавлений) — вероятно,
     след инструмента оптимизации токенов; функционально нейтрально, но шумно.

### Почему backend не в git
Не из-за `.gitignore` (правила на `backend/` нет). Он просто никогда не был
зафиксирован коммитом. `backend/.gitignore` корректно исключает `.venv/`, `.env`,
`__pycache__/`, `*.pyc`, кэши.

### Безопасный порядок сохранения (без потери работы)
Никаких деструктивных операций (`reset --hard`, `clean -f`, `checkout -- .`) не
использовать. Рекомендуемая последовательность:

1. **Бэкап-снимок всего дерева** (включая untracked): `cp -a <repo> <repo>.backup-YYYYMMDD`
   или `git bundle create ../osnova-$(date +%F).bundle --all` + tar untracked.
   Без remote это единственная страховка.
2. **Закоммитить backend отдельно**: `git add backend && git commit -m "feat(backend): FastAPI ..."`.
3. **Закоммитить тёмную тему отдельно**: `git add frontend/src/lib/theme.ts
   frontend/src/components/ui/theme-toggle.tsx frontend/src/app/globals.css
   frontend/src/app/layout.tsx frontend/src/components/layout/mobile-nav.tsx`
   (при необходимости `git add -p`, чтобы не тащить удаление комментариев).
4. **Переписанная иллюстрация** отдельным коммитом: `about-illustration.tsx`.
5. **Решить судьбу 53 файлов с удалением комментариев**: либо изолировать в один
   `chore: remove redundant JSDoc comments`, либо откатить (`git checkout -- <files>`)
   — **нужно подтверждение владельца** (см. блокирующие вопросы).
6. **Документация**: `git add docs README.md`.
7. **Добавить remote и CI** (после решения о хостинге).

---

## 2. Интеграция API

### 2.1 Реальные URL эндпоинтов
Префикс собирается как `api_prefix="/api"` → `v1` → доменные префиксы
(`app/main.py`, `app/api/router.py`, `app/api/v1/router.py`). Итог — все доменные
эндпоинты живут под **`/api/v1`**, health под **`/api/health`**:

```
GET  /api/health
GET  /api/v1/subjects
GET  /api/v1/topics?subject=
GET  /api/v1/tasks?subject&level&featured&page&page_size
GET  /api/v1/tasks/{id}
GET  /api/v1/tasks/{id}/related?limit=
POST /api/v1/tasks/{id}/check
GET  /api/v1/articles?subject=
GET  /api/v1/articles/{slug}
POST /api/v1/tutor-leads
GET  /api/v1/tutor-leads?status=            (admin)
POST /api/v1/auth/register | /auth/login | /auth/logout
GET  /api/v1/users/me | /api/v1/progress
```

### 2.2 Единый способ формирования `/api/v1`
Проблема: фронтенд строит URL как `joinUrl(base, path)` с `path = "/tasks"`
(`lib/api/server.ts`, `lib/api/client.ts`, `features/*/api.ts`), то есть **base
должен сам содержать `/api/v1`**. Документация `next-steps.md` §2.3 предлагает
`API_BASE_URL=http://localhost:8000` — с таким значением запрос уйдёт на
`/tasks` и вернёт 404.

**Рекомендация (единая точка):** ввести константу версии в `lib/api/config.ts`
(например `API_VERSION = "/api/v1"`) и строить URL как `joinUrl(base, API_VERSION, path)`,
а base задавать **origin-ом** (`http://localhost:8000`). Это устраняет двусмысленность
и делает конфиг независимым от путей версионирования. Альтернатива (без правки кода) —
документировать base как `http://localhost:8000/api/v1`, но она хрупкая. Выбор —
в блокирующих вопросах.

### 2.3 Контракт запросов/ответов (проверено по типам и схемам)
- **Задачи**: `TaskRead` (backend) ↔ `Task` (frontend). Поля совпадают:
  `id` (строка), `title`, `subject` (slug), `examLabel` (alias), `level`, `minutes`,
  `summary`, `statement` (блоки с `type`-дискриминатором), `answer{value,kind,explanation}`,
  `steps[{note,tex}]`, `topics` (массив **лейблов**), `featured`, `isDemo`. ✅
- **Пагинация**: `Page[T]` возвращает `{items,total,page,page_size,page_count}`;
  фронт читает `items/total/page/page_size`, `pageCount` считает сам. ✅
- **Статьи**: `ArticleRead` ↔ `Article`: `slug,title,description,subject,exam,
  readingMinutes, published, updated, blocks, isDemo`. ✅ Единственная шероховатость:
  `subject` у статьи может быть `null` (FK nullable), а фронтовый тип `Article.subject`
  ненулевой — нужна защита в UI (или гарантия в seed).
- **Заявки**: фронт шлёт `{name?, contact, exam, subject?, message?, consent: true}`;
  backend `TutorLeadCreate` дополнительно ждёт опциональный honeypot `website`
  (фронт его не шлёт — ок, поле необязательное). ✅

### 2.4 Подключение проверки ответов к API
Сейчас `AnswerForm` (`features/tasks/components/answer-form.tsx`) проверяет локально
через `lib/utils/check-answer.ts`. Backend уже реализует `POST /tasks/{id}/check`
(тело `{answer}`, ответ `{isCorrect, checkedAt, explanation}`) и пишет
`solution_attempts` + `user_progress`.

Минимальное подключение:
1. В `features/tasks/api.ts` добавить `checkTaskAnswer(id, answer)` →
   `clientRequest("/tasks/{id}/check", { method: "POST", body: { answer } })`.
2. В `AnswerForm` вызывать его, когда `isPublicApiConfigured()`; иначе — текущий
   локальный fallback (сохранить). Ответ `{isCorrect}` подставлять в состояние.
3. Поля `expected`/`kind`/`answerNote` больше не обязаны уходить на клиент для
   проверки, но страница всё равно отдаёт решение и ответ в HTML (серверный
   рендер) — антискрейп-выгода от переноса проверки на сервер отсутствует, выгода
   в единой логике и в наполнении прогресса. Убрать дублирующую нормализацию
   (`lib/utils/check-answer.ts`) после подключения.

### 2.5 Cookie-сессии и CORS
- `clientRequest` уже шлёт `credentials: "include"` — для `check`/`users/me`/
  `progress` cookie `site_bank_session` пойдёт автоматически. ✅
- CORS (`app/main.py`): origins явные (`localhost:3000`), но
  `allow_methods=["*"]`, `allow_headers=["*"]` с `allow_credentials=True`.
  Стоит сузить до `GET,POST` и `Content-Type,Accept`, добавить production-домен.
- Same-origin (`example.com` + `api.example.com`) покрыт `SameSite=lax`; кросс-сайт
  потребует CSRF (в коде отсутствует) — не требуется для P0, если API на поддомене.

---

## 3. Приём заявок

### 3.1 Минимальный надёжный путь «форма → преподаватель»
Текущий путь: форма → `POST /api/v1/tutor-leads` → запись в БД. **До преподавателя
сигнал не доходит** (нет уведомления, нет админки). Минимальный надёжный путь:
- В `leads/service.py::create_lead` после успешной записи отправлять уведомление.
  Минимальный вариант без новых зависимостей — **Telegram-бот** (httpx уже в
  зависимостях): `POST https://api.telegram.org/bot<token>/sendMessage`.
  Конфиг: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`. Fallback — SMTP
  (`LEAD_NOTIFY_EMAIL`), если предпочитают почту.
- Уведомление не должно блокировать запись: обернуть в try/except + лог, чтобы
  сбой отправки не возвращал 500 на форму.

### 3.2 Безопасная обработка и смена статуса
- `status` (enum new/contacted/closed) уже есть в модели и в `TutorLeadRead`.
- Добавить `PATCH /api/v1/tutor-leads/{id}` (admin) с телом `{status}` и/или
  `{note}` (заметки — опционально, не обязательно). Защита — существующий
  `require_admin`.

### 3.3 Минимальное администрирование без CMS
- **Приоритетный минимум**: CLI-скрипт `backend/scripts/leads.py` (список заявок,
  смена статуса) — ноль UI, использует те же сервисы. Плюс CLI для создания админа
  (`backend/scripts/create_admin.py`) — сейчас администратора через API не создать.
- Опционально позже (P2): минимальный защищённый маршрут `(app)/admin/leads` во
  фронтенде с авторизацией по cookie. Не строить CMS.

### 3.4 Персональные данные
- Юридический минимум: страница `/privacy` (политика обработки ПД), ссылка из
  чекбокса согласия в `lead-form.tsx` (сейчас чекбокс без ссылки).
- Технический минимум: хранить только нужное (`contact` обязателен; `name/message`
  опциональны и уже так), исправить `ip_hash` на реальный `sha256(ip+salt)`,
  предусмотреть удаление/выгрузку заявки (операция админа/скриптом), не писать ПД
  в аналитику (уже соблюдено: `track.sanitize` отбрасывает `contact/name/message`).

---

## 4. База данных

### 4.1 Переиспользование
Для P0/P1 **новые таблицы не нужны**. Всё необходимое уже есть: `subjects`, `topics`,
`tasks` (+`task_topics`), `articles`, `tutor_leads`, `users`, `user_sessions`,
`solution_attempts`, `user_progress`.

### 4.2 Минимальные изменения для публикации заданий/статей
- Поле `is_published` уже есть (default `True`) у `tasks` и `articles`; эндпоинты
  уже фильтруют по `is_published`. То есть публикация = наполнение, **миграции не
  нужны**.
- Небольшие улучшения seed (не схема): задавать `published_on` (сейчас `None`),
  `summary`/`description` как реальные тексты, `featured` для главной.

### 4.3 Идемпотентное начальное наполнение
- Текущий `scripts/seed.py` идемпотентен только по `subjects` (если есть предметы —
  пропускает всё). Улучшить до **upsert по естественному ключу** (`slug` у
  subject/topic/article, `(title+subject)` или добавить стабильный `source_ref`
  у task) — тогда повторный запуск дополняет/обновляет, а не дублирует.
- `source_ref` у `tasks` уже есть (nullable string) — можно использовать как ключ
  идемпотентности.

### 4.4 Что можно отложить (P2+)
CRUD-админка контента, сохранение результатов диагностики, сброс пароля /
подтверждение e-mail, медиа/загрузки, подборки/коллекции, SEO-поля контента в БД.

---

## 5. SEO

### 5.1 Существующее (проверено)
- Маршруты: `/`, `/zadachi`, `/zadachi/[id]`, `/articles`, `/articles/[slug]`,
  `/matematika`, `/informatika`, `/podgotovka`, `/diagnostika`, 404/error.
- `metadata.ts::buildMetadata` → title/description/canonical/OG/Twitter/robots.
- `robots.ts` → allow all, disallow `/api/`, sitemap. `sitemap.ts` → статические
  + задачи + статьи (из **фикстур**).
- JSON-LD: WebSite, BreadcrumbList, Article, LearningResource, Person, Service,
  FAQPage. Динамические OG у задач/статей (`opengraph-image.tsx`).
- Canonical каталога всегда `/zadachi` (метаданные статические), т.е. фильтры
  канонизируются корректно.
- `cacheComponents: false` (осознанно, против soft-404) — сохранено.

### 5.2 Включить опубликованные материалы из API в sitemap
- `sitemap.ts` сейчас синхронный и читает `getTaskIdList()`/`getArticleSlugList()`
  (фикстуры). Нужно: сделать `sitemap()` асинхронным; когда `isServerApiConfigured()`,
  получать id/slug из API (`GET /tasks?page_size=100` постранично; `GET /articles`),
  иначе — фикстуры. `lastModified` брать из `published`/`updated` (не `BUILD_DATE`).
- Аналогично пересмотреть `generateStaticParams` в `[id]/page.tsx` и
  `[slug]/page.tsx`: при API отдавать реальные id/slug (или перейти на
  `dynamicParams` + ISR по мере роста банка — P1/P2).

### 5.3 Разделение интентов: хабы vs каталог
Риск каннибализации между `/matematika` и `/zadachi?subject=matematika`.
Предложение (закрепить в SEO-плане):
- `/matematika`, `/informatika` — **предметные хабы** (обзор тем, что разбираем,
  избранные задачи, разборы, внутренние ссылки) под широкие запросы
  «математика огэ егэ».
- `/zadachi` (+фильтры) — **транзакционный каталог** под «решить задачу».
- Разные H1/описания уже есть; усилить: уникальные вводные тексты хабов, перелинковку
  хаб↔каталог↔статьи, не создавать отдельные URL вида `/zadachi/matematika`
  (использовать query-фильтр, canonical на `/zadachi`).

### 5.4 SEO-план P0/P1
Отсутствует в репозитории. Добавляется как документация + список страниц (см.
`docs/implementation-plan.md`, §6 и задача S-1). Отдельный `docs/seo-plan.md`
рекомендуется после первого семантического сбора (нужны реальные ключи/частоты).

---

## 6. План страниц (минимальный P0 и следующий P1)

Не создаём все ~30 страниц сразу. Сначала P0-релиз, затем P1.

### P0 (обязательно к запуску) — уже существующие маршруты, довести до рабочего
| Маршрут | Назначение | Текущее состояние |
| --- | --- | --- |
| `/` | главная | готово (контент демо) |
| `/zadachi` | каталог с фильтрами | готово, подключить API |
| `/zadachi/[id]` | страница задачи | готово, подключить API + проверку |
| `/articles` | список статей | готово, подключить API |
| `/articles/[slug]` | статья | готово, подключить API |
| `/matematika`, `/informatika` | предметные хабы | готово, наполнить реальным контентом |
| `/podgotovka` | репетитор + заявка | готово, добавить уведомление + юр.текст |
| `/privacy` | политика ПД | **отсутствует — создать** |
| 404 | — | готово |

### P1 (следующая итерация) — новые страницы, без дублирования интентов
| Маршрут | Интент | Отличие от существующих |
| --- | --- | --- |
| `/ege-matematika`, `/oge-matematika` | «как готовиться к ЕГЭ/ОГЭ по математике» (гайд) | от `/matematika` (обзор предмета) и `/zadachi` (решить) |
| `/ege-informatika`, `/oge-informatika` | то же для информатики | аналогично |
| `/diagnostika` | лид-магнит | уже есть; доработать связь с заявкой (P1/P2) |
| Подборки `/zadachi/...` (по темам) | «задачи по производной» | только после реального банка; иначе каннибализация |

Исключить как дубли: `/zadachi/matematika` (уже покрыто фильтром), отдельные
страницы на каждый `topic` без контента.

---

## 7. Итоговые выводы

1. Проект архитектурно здоров: чистый слой API на фронте, согласованный контракт
   доменных типов, единый конверт ошибок, зрелая SEO-инфраструктура, аккуратный
   backend (9 тестов зелёные).
2. **Критический риск №1 — отсутствие remote**: весь проект (включая новый backend
   и тёмную тему) существует только на этой машине. Первое действие — бэкап и
   фиксация в git.
3. **Критический риск №2 — разъезд base-URL API**: единый способ формирования
   `/api/v1` нужно закрепить в коде (константа версии), а не в документации.
4. Контракт данных согласован; правка нужна точечная (base-URL, `Article.subject`
   nullable, проверка ответа через API).
5. Для запуска новые таблицы и миграции не нужны; публикация = наполнение через
   идемпотентный seed.
6. Заявки требуют: уведомление преподавателя (Telegram/SMTP), смену статуса,
   минимальный админ-доступ (CLI достаточно), страницу `/privacy` и исправление
   `ip_hash`.
7. SEO: sitemap/`generateStaticParams` должны читать API-контент; хабы и каталог
   разделить по интенту; SEO-план P0/P1 оформить документацией.

**Блокирующие вопросы** — см. конец `docs/implementation-plan.md`.
