# Аудит под интерактивные статьи

Дата: 2026-10-17. Режим: только чтение — код, схема БД, миграции и конфигурация
не менялись; коммитов и пушей не было. Все выводы подтверждены фактическими
файлами репозитория; привожу пути и, где важно, строки.

**Фокус.** Существующая система статей — это статичный контент с блоками. Цель
проекта — довести её до *интерактивных образовательных статей*: SEO-текст,
LaTeX-формулы, графики, упражнения, пошаговые решения и последующая интеграция с
учебным прогрессом. Этот отчёт фиксирует текущее состояние и то, что можно
переиспользовать, а в конце даёт план следующей итерации — проектирование
контракта интерактивных статей.

---

## 1. Фактическая архитектура

Два приложения в одном монорепозитории:

```
repo_site_bank/
├── frontend/    # Next.js 16 (App Router, Turbopack) + React 19 + TS + Tailwind 4
├── backend/     # FastAPI + SQLAlchemy 2 (async) + Alembic + PostgreSQL/SQLite
├── docs/        # техническая документация (этот отчёт здесь)
├── ideal.html   # исходный HTML-прототип (дизайн-референс, не продакшн)
└── README.md
```

**Backend** — модульная структура «доменов» (`app/domains/<domain>/`), каждый
домен содержит `models.py` / `schemas.py` / `service.py` / `router.py` (у
`sessions` нет роутера и схем — это сервисный домен). Домены: `articles`,
`leads`, `progress`, `sessions`, `solutions`, `subjects`, `tasks`, `topics`,
`users`.

Слои (`backend/app/`):
- `api/` — корневой роутер (`/api/health`) + `v1/router.py`, куда монтируются все доменные роутеры (`backend/app/api/v1/router.py:11-28`).
- `core/` — `config.py` (настройки), `exceptions.py` (единый конверт ошибок), `security.py` (scrypt, токены), `logging.py`.
- `db/` — `base.py` (декларативная база, миксины, портируемые типы), `session.py` (async-движок и сессии), `naming.py` (конвенция имён ограничений).
- `common/` — `pagination.py` (пагинация), `schemas.py` (общие схемы `ORMModel`, `ErrorResponse`).

**Frontend** — фиче-структура (`src/features/<feature>/`): `home`, `tasks`,
`articles`, `topics`, `tutor-leads`, `diagnostics`. Общие слои: `src/lib/api`
(транспорт), `src/lib/seo` (metadata/JSON-LD), `src/lib/utils`,
`src/components/{layout,ui,seo}`.

---

## 2. Стек и точные версии

### Backend (`backend/pyproject.toml` + `backend/uv.lock`)

`pyproject.toml` задаёт нижние границы, `uv.lock` фиксирует фактические версии:

| Пакет | Ограничение (`pyproject.toml`) | Фактическая (`uv.lock`) |
| --- | --- | --- |
| fastapi | `>=0.115` | **0.143.2** |
| sqlalchemy[asyncio] | `>=2.0.36` | **2.1.4** |
| pydantic | `>=2.9` | **2.14.1** |
| pydantic-settings | `>=2.6` | **2.16.0** |
| asyncpg (драйвер PG) | `>=0.30` | **0.32.0** |
| alembic | `>=1.14` | **1.20.0** |
| uvicorn[standard] | `>=0.32` | **0.54.0** |
| email-validator | `>=2.2` | 2.9.0 |
| httpx | `>=0.28` | 0.28.1 |

Dev-группа: `pytest` 9.1.1, `pytest-asyncio` 1.4.0, `aiosqlite` 0.22.1,
`ruff` 0.17.1. Python: `requires-python = ">=3.14"` (в `Dockerfile` — 3.14).

### Frontend (`frontend/package.json`)

- `next` **16.4.0**, `react`/`react-dom` **19.3.0**, `katex` ^0.19.0.
- `zod` ^4.6.6, `react-hook-form` ^7.90.0, `@hookform/resolvers` ^5.9.1.
- UI: `@radix-ui/react-dialog`/`label`/`slot`, `class-variance-authority`,
  `clsx`, `tailwind-merge`, `lucide-react`, `tailwindcss` ^4.
- Dev: `typescript` ^5, `eslint` ^9 + `eslint-config-next`, `prettier` +
  `prettier-plugin-tailwindcss`, `vitest` ^5, `@testing-library/*`, `jsdom`,
  `@playwright/test` ^1.64.
- `server-only` ^0.0.1 (изоляция серверного транспортного слоя).

> `@tanstack/react-query` намеренно не используется — публичные страницы
> рендерятся на сервере (`frontend/README.md:27-30`).

---

## 3. СУБД, миграции, SQLAlchemy, транзакции

- **СУБД:** PostgreSQL 17 в проде (`backend/compose.yaml`, драйвер `asyncpg`);
  SQLite для локальных экспериментов и тестов (`aiosqlite`). Конфиг БД — один
  параметр `DATABASE_URL` (`backend/app/core/config.py:35`).
- **Движок:** асинхронный. `get_engine()` создаётся лениво через
  `@lru_cache`, `pool_pre_ping=True` (`backend/app/db/session.py:25-32`).
- **Сессии/транзакции:** `get_session()` — FastAPI-зависимость «одна сессия на
  запрос»: `yield` → `commit()` при успехе, `rollback()` при исключении
  (`backend/app/db/session.py:39-48`). Для скриптов/фоновых задач —
  `session_scope()` (там же, строки 51-61).
- **Миграции:** Alembic. `alembic.ini` оставляет `sqlalchemy.url` пустым —
  `DATABASE_URL` читается из настроек приложения (`backend/migrations/env.py:37`).
  В `env.py` явно импортируются все доменные модули моделей, чтобы
  `Base.metadata` был полон для autogenerate (`env.py:21-29`). `compare_type=True`.
- **Одна миграция:** `backend/migrations/versions/32b21a07d4ef_initial_schema.py`
  (`down_revision = None`), соответствует текущим моделям.
- **Типы/конвенции** (`backend/app/db/base.py`):
  - `Base` с `MetaData(naming_convention=NAMING_CONVENTION)` (`naming.py`) — детерминированные имена ограничений для autogenerate.
  - `TimestampMixin` — `created_at`/`updated_at` (naive UTC, т.к. колонки `DateTime` без TZ; `utcnow()`).
  - `JSONType = JSON().with_variant(JSONB(), "postgresql")` — JSONB в PG, JSON в SQLite.
  - `UUIDType` — нативный `UUID` в PG, `CHAR(32)` в SQLite.
  - `enum_values()` — энумы персистятся по **значениям**, а не именам.

---

## 4. Текущая схема БД

10 таблиц. Все подтверждены моделями (`backend/app/domains/*/models.py`) и
миграцией `32b21a07d4ef_initial_schema.py`.

| Таблица | Домен | Поля (ключевые) | Связи |
| --- | --- | --- | --- |
| `subjects` | subjects | `id`, `slug`(uniq), `label`, `position` | — |
| `topics` | topics | `id`, `slug`(uniq), `label`, `subject_id` FK, `position` | → `subjects` (CASCADE) |
| `tasks` | tasks | `id`, `title`, `subject_id` FK, `exam_label`, `level`(enum), `minutes`, `summary`, JSON `statement`/`answer`/`steps`, `featured`, `is_published`, `source_ref` | → `subjects` (RESTRICT); ↔ `topics` через `task_topics` |
| `task_topics` | tasks | PK(`task_id`,`topic_id`) | M2M задачи↔темы (CASCADE) |
| `articles` | articles | `id`, `slug`(uniq), `title`, `description`, `subject_id` FK(nullable), `exam`, `reading_minutes`, `published_on`(Date), `updated_on`(Date), JSON `blocks`, `is_published` | → `subjects` (SET NULL) |
| `users` | users | `id` UUID, `email`(uniq), `hashed_password`, `display_name`, `role`(enum), `is_active` | — |
| `user_sessions` | sessions | `id` UUID, `token_hash`(uniq), `user_id` FK, `expires_at`, `last_used_at`, `user_agent`, `ip_hash` | → `users` (CASCADE) |
| `solution_attempts` | solutions | `id`, `task_id` FK, `user_id` FK(nullable), `answer_value`, `outcome`(enum), `checked_at` | → `tasks` (CASCADE), `users` (SET NULL) |
| `user_progress` | progress | `id`, `user_id` FK, `task_id` FK, `attempts`, `correct_attempts`, `solved`; UNIQUE(`user_id`,`task_id`) | → `users`, `tasks` (CASCADE) |
| `tutor_leads` | leads | `id`, `name`, `contact`(index), `exam`/`subject`/`status`(enum), `message`, `consent`, `source`, `ip_hash` | — |

Ключевое для интерактивных статей:

- **Статья** (`articles/models.py:12-30`): контент — единственная JSON-колонка
  `blocks: Mapped[list[dict]]` (`JSONType`). Связь с предметом опциональна
  (`subject_id` nullable, `ondelete="SET NULL"`). Есть `is_published`,
  `published_on`/`updated_on` — даты для SEO/sitemap.
- **Прогресс** (`progress/models.py:11-24`) привязан **только к задачам**
  (`task_id` FK). Упражнений в статьях как сущности нет.
- **Попытки ответа** (`solutions/models.py:18-33`) — тоже только к задачам.

---

## 5. Существующий API статей (и связанные эндпоинты)

Все доменные эндпоинты живут под `/api/v1` (сборка префикса:
`api_prefix="/api"` → `/v1` → доменный префикс).

### Статьи (`backend/app/domains/articles/`)

| Метод/путь | Роутер | Возвращает |
| --- | --- | --- |
| `GET /api/v1/articles?subject=<slug>` | `router.py:13-18` | `list[ArticleRead]` — **без пагинации**, все опубликованные |
| `GET /api/v1/articles/{slug}` | `router.py:21-27` | `ArticleRead` или 404 (`NotFoundError`) |

Сервис (`service.py`): `list_articles` (фильтр `is_published=True`, сортировка
`published_on desc nullslast, id desc`, опц. фильтр по `subject.slug`),
`get_article_by_slug` (фильтр `is_published=True` + `slug`).

### Схема `ArticleRead` (`schemas.py:25-52`)

Wire-формат: `slug`, `title`, `description`, `subject` (slug или `null`), `exam`,
`readingMinutes` (alias `reading_minutes`), `published`, `updated`, `blocks`,
`isDemo` (alias `is_demo`, **всегда `False`** — демо-флаг существует только на
фронтенде). Собирается из ORM через `ArticleRead.from_article`.

### Блоки — общие со задачами

Типы блоков определены в **`backend/app/domains/tasks/schemas.py`**, статьи
переиспользуют их (`articles/schemas.py:9-22`):

```python
ArticleBlock = ParagraphBlock | HeadingBlock | ListBlock | FormulaBlock | QuoteBlock
```

Пять типов: `paragraph{text}`, `heading{text,id}`, `list{ordered?,items}`,
`formula{tex,caption?}`, `quote{text}`. Валидация — через
`TypeAdapter[list[ArticleBlock]]` с дискриминатором `type`.

> Важно: дискриминированный юнион блоков у задач (`StatementBlock`) и у статей
> (`ArticleBlock`) **идентичен по составу и находится в домене tasks** — статьи
> зависят от `tasks/schemas.py`. Расширение набора блоков для статей неизбежно
> затрагивает и домен задач (см. §11).

### Связанные эндпоинты (переиспользуемы для упражнений)

- `POST /api/v1/tasks/{id}/check` (`solutions/router.py:17-30`) — тело
  `{answer}`, ответ `{isCorrect, checkedAt, explanation?}`. Принимает
  опционального пользователя по cookie (`get_optional_user`).
- `GET /api/v1/progress` (`progress/router.py:15-21`) — `list[ProgressRead]`
  для текущего пользователя (`get_current_user`).
- `GET /api/v1/tasks`, `GET /api/v1/tasks/{id}`, `GET /api/v1/tasks/{id}/related` — банк задач.
- `GET /api/v1/subjects`, `GET /api/v1/topics?subject=` — справочники.

### Логика проверки ответа (`solutions/service.py`)

`normalize_answer` (число: trim, запятая→точка, trailing zeros; текст: lowercase,
схлопывание пробелов), `answers_match`, `check_answer` — пишет `SolutionAttempt`
и, если пользователь известен, обновляет `user_progress` через
`progress/service.py::record_attempt` (upsert).

### Единый конверт ошибок

`backend/app/core/exceptions.py`: `{"error": {"code","message","details"}}`.
Обрабатываются `AppError` (и подклассы `NotFoundError`/`ConflictError`/
`UnauthorizedError`/`ForbiddenError`/`RateLimitedError`), `RequestValidationError`
(422), `StarletteHTTPException`, `IntegrityError` (409), `Exception` (500).

---

## 6. Аутентификация, авторизация, права

- **Серверные сессии + HttpOnly cookie** (не JWT) — `users/router.py`,
  `sessions/service.py`. Cookie `site_bank_session`, в БД хранится только
  SHA-256 токена.
- Зависимости прав (`users/deps.py`):
  - `get_optional_user` — cookie → `User | None` (аноним ок).
  - `get_current_user` — 401, если нет пользователя.
  - `require_admin` — 403, если роль не `admin`.
- Роли (`users/models.py:12-15`): `student`, `teacher`, `admin`. Регистрация
  всегда создаёт `student` (`users/service.py:24`).
- Пароли: scrypt + соль (`core/security.py`), сравнение `hmac.compare_digest`.

Для статей/упражнений это значит: чтение публичное; проверка ответа уже умеет
работать как для анонима (пишет попытку с `user_id=null`), так и для
авторизованного (дополнительно пишет прогресс).

---

## 7. Архитектура frontend

### Маршруты (`frontend/src/app/`)

App Router, публичная группа `(public)/` (layout с header/footer):

| Маршрут | Файл | Рендер |
| --- | --- | --- |
| `/` | `(public)/page.tsx` | SSG |
| `/zadachi` | `(public)/zadachi/page.tsx` | SSR (searchParams) |
| `/zadachi/[id]` | `(public)/zadachi/[id]/page.tsx` | SSG + `generateStaticParams` |
| `/articles` | `(public)/articles/page.tsx` | SSG |
| `/articles/[slug]` | `(public)/articles/[slug]/page.tsx` | SSG + `generateStaticParams` |
| `/matematika`, `/informatika` | хабы | SSG |
| `/podgotovka`, `/diagnostika`, `/privacy` | … | SSG / клиентская диагностика |

Корневые: `layout.tsx` (metadataBase, шрифты, Яндекс.Метрика), `not-found.tsx`,
`robots.ts`, `sitemap.ts`, `icon.svg`, `globals.css`.

### Слой API (`src/lib/api/`)

- `config.ts` — `API_PREFIX = "/api/v1"`, `apiUrl(base, path)` собирает
  `base/api/v1/path`; `DEFAULT_DEV_API_ORIGIN = "http://localhost:8000"`;
  `timeoutMs = 10_000`.
- `server.ts` — `serverRequest<T>()` (серверный fetch, `server-only`, опции
  `searchParams`/`tags`), `isServerApiConfigured()` (env `API_BASE_URL` или
  dev-origin).
- `client.ts` — `clientRequest<T>()` (браузерный fetch, `credentials: "include"`
  для cookie-сессий).
- `errors.ts` — `ApiError` (kind: `unconfigured|network|timeout|http|unknown`),
  `toApiError`, `describeApiError` (локализованные сообщения).
- `generated/` — зарезервирован под `openapi-typescript`, сейчас только README
  (типы из OpenAPI ещё не генерируются; доменные типы дублируются вручную в
  `features/*/types.ts`).

### Фича `articles` (`src/features/articles/`)

- `types.ts` — `Article`, `ArticleBlock` (те же 5 типов), `ArticleTocItem`.
  `Article.subject` ненулевой (`TaskSubject`), `published: string`.
- `api.ts` — `getArticles`, `getArticleBySlug`, `getArticlesBySubject`,
  `getRelatedArticles`, `getArticleSlugs` (для `generateStaticParams` и sitemap).
  Переключение фикстуры/API через `isServerApiConfigured()`.
- `toc.ts` — `getArticleToc`: заголовки → оглавление, если их ≥3.
- `components/` — `article-body`, `article-card`, `article-meta`, `article-toc`,
  `related-articles`.
- `fixtures/articles.ts` — 3 демо-статьи (`isDemo: true`).

### Страница статьи (`(public)/articles/[slug]/page.tsx`)

Полный путь рендера:
1. `generateStaticParams` → `getArticleSlugs()`.
2. `generateMetadata` → `buildMetadata({ type: "article", publishedTime, modifiedTime })`.
3. Тело: `JsonLd(articleJsonLd(...))` → `PageHero` (breadcrumbs, `ArticleMeta`) →
   `Section` с сеткой 12 колонок: `ArticleToc` (если есть) + `ArticleBody`
   (с `midSlot = <TutorCta placement="article-mid">`) → `RelatedArticles` →
   кнопка «Все статьи».
4. Динамическая OG-картинка: `opengraph-image.tsx`.

`ArticleBody` (`article-body.tsx:7-55`) — `switch` по `block.type`, рендер через
`RichText` (инлайн `$...$` → KaTeX) и `Math` (display). **Интерактивных/графических
блоков нет.**

### SEO (`src/lib/seo/`, `src/app/`)

- `metadata.ts::buildMetadata` — title/description/canonical/OG/Twitter/robots(noIndex).
- `json-ld.ts` — `webSiteJsonLd`, `breadcrumbJsonLd`, `articleJsonLd`,
  `learningResourceJsonLd`, `personJsonLd`, `serviceJsonLd`, `faqPageJsonLd`.
- `sitemap.ts` — статические маршруты + задачи + статьи (сейчас берёт slug из
  `getArticles()`, `lastModified` из `article.updated ?? published`).
- `robots.ts` — allow all, `disallow /api/`, sitemap.

### Интерактив и графики — существующие прецеденты

- **Проверка ответа на задаче:** `features/tasks/components/answer-form.tsx`
  (client). Вызывает `checkTaskAnswer` (`features/tasks/api-client.ts` →
  `clientRequest POST /tasks/{id}/check`), при отсутствии API — локальный
  fallback `lib/utils/check-answer.ts`. Показывает `solution` (серверный
  `SolutionSteps`), рейтинг по попыткам, CTA после неверных ответов.
- **Диагностика:** `features/diagnostics/components/diagnostics-runner.tsx`
  (client) — квиз с радио-вариантами и отчётом; ближайший аналог «упражнения
  внутри страницы», но целиком клиентский, без сохранения на сервер.
- **График:** `features/home/components/derivative-graph.tsx` +
  `derivative-viz.tsx` — **самописный SVG-график**: точки считаются на сервере,
  на клиент уходит только разметка + `range input` поверх SVG. Сторонней
  charting-библиотеки в зависимостях нет.

---

## 8. Зависимости между доменами

```
subjects ←— topics (subject_id)
subjects ←— tasks (subject_id)          tasks ↔ topics (task_topics)
subjects ←— articles (subject_id, nullable)
tasks ←—— solutions/solution_attempts (task_id)
tasks ←—— progress/user_progress (task_id)
users ←—— sessions/user_sessions (user_id)
users ←—— solutions (user_id, nullable)
users ←—— progress (user_id)
leads — автономен
```

Программные зависимости (импорты):

- `articles/schemas.py` импортирует блоки из **`tasks/schemas.py`** — единственный
  случай, когда один домен переиспользует схемы другого на уровне контента.
- `solutions/service.py` локально импортирует `progress/service.py::record_attempt`
  (избегая цикла) — проверка ответа → прогресс.
- `users/deps.py` ← `sessions/service.py` (резолв сессии по cookie).

Вывод: контентные блоки — общий ресурс между `tasks` и `articles`; решение «где
живут типы блоков» напрямую влияет на дизайн контракта интерактивных статей.

---

## 9. Что можно переиспользовать (уже принятые решения)

1. **Блочная модель контента с дискриминатором.** `type`-дискриминированный
   юнион на обеих сторонах (Pydantic `Field(discriminator="type")` +
   `TypeAdapter` на бэке; TS-юнион на фронте). Добавление новых типов блоков —
   расширение существующего паттерна, а не изобретение нового.
2. **Хранение контента в JSONB.** `articles.blocks` уже `JSONType`; схема БД не
   запрещает новые формы блоков (валидация — на уровне Pydantic). Для чисто
   текстовых/структурных блоков миграция схемы может не понадобиться.
3. **KaTeX на сервере + инлайн-математика.** `components/ui/math.tsx`
   (`katex.renderToString`, server) и `components/ui/rich-text.tsx`
   (парсинг `$...$`). Формулы в статьях уже работают.
4. **Проверка ответа + прогресс.** `POST /tasks/{id}/check`, `solutions/service.py`
   (нормализация, запись `solution_attempts` + `user_progress`). Для упражнений
   в статье можно переиспользовать саму логику и эндпоинт, если упражнение
   ссылается на задачу (или обобщить на «элемент»).
5. **Пошаговые решения.** `SolutionStep{note, tex}` + `SolutionSteps.tsx`
   (нумерованный список с формулами) — готовый виджет шагов решения.
6. **Самописные SVG-графики.** Паттерн «вычисление на сервере, рендер SVG на
   клиенте» (`derivative-graph`) — отправная точка для графиков в статьях, без
   тяжёлой charting-зависимости в клиентском бандле.
7. **SEO-инфраструктура.** `buildMetadata`, `articleJsonLd`, `sitemap.ts`
   (статьи уже включены), динамический `opengraph-image.tsx` на страницу статьи.
8. **Транспортный слой.** `serverRequest`/`clientRequest`, префикс `/api/v1`,
   `ApiError`/`describeApiError`, единый конверт ошибок бэкенда.
9. **CTA-вставки.** `ArticleBody` уже принимает `midSlot` (сейчас `TutorCta`) —
   готовая точка для вставки интерактивных блоков в середину текста.
10. **Idempotent seed по естественному ключу.** `scripts/seed.py` upsert по
    `slug` (статьи) / `source_ref` (задачи).

---

## 10. Проблемы и риски интеграции

1. **Набор блоков замкнут и общий с задачами.** `ArticleBlock` = `StatementBlock`
   (5 типов) живёт в `tasks/schemas.py`. Новые типы (`exercise`, `graph`,
   `image`, `code`, `steps`, `callout`) придётся добавлять в общий юнион либо
   разводить юнионы задач и статей. Второе — чище, но ломает текущее
   переиспользование `tasks/schemas.py` в `articles/schemas.py:9-22`.
2. **Нет интерактивных/графических блоков.** `ArticleBody` обрабатывает только
   `paragraph/heading/list/formula/quote`; графиков, изображений, кода,
   упражнений нет ни в моделях, ни в компонентах.
3. **Проверка ответа привязана к задачам.** `POST /tasks/{id}/check` требует
   `task_id`; `user_progress` и `solution_attempts` ссылаются на `tasks.id`.
   Упражнения статьи «сами по себе» не имеют сущности для прогресса — нужна либо
   ссылка на задачу, либо обобщение прогресса (новая таблица/поле — миграция).
4. **Нет графической библиотеки.** Для «графиков» придётся либо развивать
   самописный SVG-подход (как `derivative-graph`), либо добавить зависимость —
   это отдельное решение (размер бандла, SSR/гидрация, доступность).
5. **Статьи не пагинируются.** `GET /articles` возвращает все статьи целиком с
   `blocks` (`articles/service.py:15-22`); `ArticleListItem` (компактная схема)
   объявлен, но не используется (`schemas.py:55-61`). При росте числа статей —
   нагрузка и лишний трафик.
6. **Расхождение типов.** `Article.subject` на бэке `str | None` (FK nullable),
   на фронте — ненулевой `TaskSubject` (`types.ts:14`). Риск `null` в UI не
   обработан.
7. **Дублирование нормализации ответа.** Бэкенд `solutions/service.py::normalize_answer`
   (через `float`) и фронт `lib/utils/check-answer.ts` (regex + `Number`, допуск
   `1e-9`) различаются. Для упражнений в статьях важно иметь **одну** логику
   проверки.
8. **Демо/прод расхождение.** `is_demo` на бэке всегда `False`; демо-флаг живёт
   только в фикстурах фронта. Список `isDemo`-источников и признак «из БД» не
   разведены явно для статей (в отличие от задач, где это тоже рудиментарно).
9. **`subject` у статей опционален.** Интерактивная статья без предмета не сможет
   попасть в тематические подборки/хабы и в связку «прогресс по предмету».
10. **SEO-полей контента нет в БД.** У статей только `title`/`description`;
    `meta_title`, `canonical`, `og_image`, `noindex` отсутствуют (для
    «SEO-текста» из цели проекта может понадобиться — решение по объёму).
11. **Прогресс/упражнения не сохраняются из UI.** Для задач проверка уже ходит в
    API (`answer-form.tsx`), но упражнений в статьях нет вовсе; если они появятся
    «клиентскими» (как диагностика), прогресс останется пустым.

---

## 11. Предлагаемые изменения (для интерактивных статей)

> Ниже — предложения, **не** реализованные изменения. Файлы/поля/эндпоинты
> помечены как предложения и не существуют в текущем коде.

1. **Расширить контракт блоков**, не ломая задачи: ввести отдельный юнион
   `ArticleBlock` в домене `articles`, включив существующие 5 типов (переиспользовав
   их) + новые типы, минимально необходимые для цели:
   - `exercise` — встроенное упражнение (варианты/ввод ответа, ссылка на шаги решения);
   - `graph` / `plot` — график (функция/точки, параметры);
   - возможно `code` (для информатики), `image` (картинка), `steps` (пошаговый разбор внутри статьи), `callout`.
2. **Определить модель упражнения:** либо (а) ссылка на существующую `tasks.id`
   (переиспользовать `POST /tasks/{id}/check` + `user_progress` без миграции), либо
   (б) автономное упражнение с собственным хранением и обобщённым прогрессом
   (миграция). Вариант (а) — самый дешёвый старт.
3. **Графики:** зафиксировать подход (самописный SVG по образцу
   `derivative-graph` vs библиотека) до реализации; при самописном — «данные
   считаем на сервере, SVG на клиенте».
4. **Единая проверка ответа:** убрать расхождение нормализации; для упражнений
   ходить в API, оставив локальный fallback только для сборки без API.
5. **Прогресс по статьям/упражнениям:** решить, расширяется ли `user_progress`
   на «элементы» статей или заводится отдельная сущность (миграция) — отложить
   до согласования контракта (см. §13).
6. **Пагинация/компактный список статей** при необходимости (сейчас список без
   пагинации — риск только при росте контента).
7. **Выравнивание типов** (`Article.subject` nullable) и, при необходимости,
   SEO-поля контента.

---

## 12. Файлы, которые предположительно потребуется изменить

> Список «как есть» + вероятные точки правки для интерактивных статей.

### Backend

| Файл | Что сейчас | Вероятное изменение |
| --- | --- | --- |
| `backend/app/domains/articles/schemas.py` | `ArticleBlock` из 5 типов, `ArticleRead` | расширение юниона блоков, схема упражнения |
| `backend/app/domains/articles/models.py` | `blocks: list[dict]` (JSONB) | новые колонки только если упражнение/прогресс автономны (миграция) |
| `backend/app/domains/tasks/schemas.py` | общие типы блоков, `StatementBlock` | вынести общие блоки в общий модуль, если юнионы разводятся |
| `backend/app/domains/articles/service.py` | `list_articles`, `get_article_by_slug` | пагинация, выборки по упражнениям |
| `backend/app/domains/articles/router.py` | 2 эндпоинта | новые эндпоинты (напр. проверка упражнения) |
| `backend/app/domains/solutions/service.py` | `check_answer` (task-scoped) | обобщение проверки на упражнения/элементы |
| `backend/app/domains/progress/models.py` | `user_progress` (task_id) | обобщение ключа прогресса (миграция) |
| `backend/migrations/versions/` | одна миграция | **новая миграция** при изменении схемы |
| `backend/scripts/seed.py` | seed статей с блоками | примеры интерактивных блоков |

### Frontend

| Файл | Что сейчас | Вероятное изменение |
| --- | --- | --- |
| `frontend/src/features/articles/types.ts` | `Article`, `ArticleBlock` (5 типов) | новые типы блоков/упражнения |
| `frontend/src/features/articles/components/article-body.tsx` | `switch` по 5 типам | рендер новых блоков (exercise/graph/…) |
| `frontend/src/features/articles/api.ts` | `getArticles`, `getArticleBySlug`, … | новые запросы (проверка упражнения) |
| `frontend/src/features/tasks/api-client.ts` | `checkTaskAnswer` | переиспользование/обобщение под упражнения |
| `frontend/src/features/tasks/components/answer-form.tsx` | проверка ответа задачи | шаблон для формы упражнения |
| `frontend/src/features/tasks/components/solution-steps.tsx` | пошаговое решение | переиспользование в статьях |
| `frontend/src/components/ui/math.tsx`, `rich-text.tsx` | KaTeX | без изменений (переиспользуются) |
| `frontend/src/app/(public)/articles/[slug]/page.tsx` | страница статьи | вставка интерактивных блоков |
| `frontend/src/features/articles/fixtures/articles.ts` | демо-статьи | демо с новыми блоками |
| `frontend/src/lib/seo/json-ld.ts` | `articleJsonLd` | при необходимости разметка упражнений |
| `frontend/src/lib/utils/check-answer.ts` | локальная нормализация | выравнивание с бэком/удаление дубля |

---

## 13. Рекомендуемый порядок реализации

1. **Согласовать контракт блоков** (итерация «контракт», см. §14): какие новые
   типы блоков и какую форму имеет упражнение — до написания кода.
2. **Расширить модель блоков статей** (backend-схемы + frontend-типы) на
   структурированные, неинтерактивные блоки (`steps`, `callout`, `image`), не
   трогая схему БД (JSONB уже есть).
3. **Добавить рендер новых блоков** в `article-body.tsx` (переиспользуя
   `Math`/`RichText`/`SolutionSteps`).
4. **Подключить упражнение через ссылку на задачу** (вариант (а) §11.2):
   упражнение = `{ type: "exercise", taskId }` + клиентская форма на основе
   `answer-form.tsx` + `POST /tasks/{id}/check`. Прогресс наполняется
   существующим механизмом без миграции.
5. **Графики**: выбрать и реализовать один тип блока (по образцу
   `derivative-graph`).
6. **Унифицировать проверку ответа** (убрать дублирование нормализации).
7. **Прогресс по статьям** (вариант (б)) и пагинация статей — только когда
   контракт устоится и понадобится масштаб.

---

## 14. План следующей итерации: контракт интерактивных статей

Следующая итерация — **проектирование контракта** (без реализации и без
миграций). Деливераблы:

1. **Словарь блоков статьи v2.** Зафиксировать полный список типов блоков с
   точной JSON-схемой каждого (поля, обязательность, вложенность) и их
   TS-типами. Явно решить:
   - остаётся ли юнион общим со задачами или разводится (`articles` vs `tasks`);
   - какие блоки чисто контентные (`paragraph`, `heading`, `list`, `formula`,
     `quote` — уже есть; `callout`, `image`, `code`, `steps` — новые), а какие
     интерактивные (`exercise`, `graph`).
2. **Контракт упражнения.** Определить дискриминированные варианты (напр.
   `choice` / `input` / `fill`) и главный вопрос — «ссылка на задачу» против
   «автономное упражнение». Зафиксировать, что именно уходит на клиент и что
   возвращает проверка (переиспользуя форму `{isCorrect, checkedAt, explanation?}`).
3. **Контракт графика.** Формат данных блока `graph` (функции/точки/оси/
   интерактивность) и граница «сервер вычисляет — клиент рисует».
4. **Модель прогресса по статьям.** Решить, как упражнения статей отражаются в
   прогрессе: переиспользование `user_progress.task_id` (через ссылку на задачу)
   или новая сущность (с проекцией на возможную миграцию).
5. **API-контракт.** Список изменений эндпоинтов (расширение `ArticleRead.blocks`,
   новые/обобщённые эндпоинты проверки), без реализации.
6. **Карта SEO.** Как новые блоки влияют на `generateMetadata`, `articleJsonLd`,
   `sitemap` (даты, canonical, `og_image`).

Результат итерации — документ-контракт (например,
`docs/interactive-articles-contract.md`) с точными схемами, на который опирается
последующая реализация (§13, шаг 1).

---

## Приложение: подтверждающие факты (сводно)

- Версии: `backend/uv.lock` (fastapi 0.143.2, sqlalchemy 2.1.4, pydantic 2.14.1,
  asyncpg 0.32.0, alembic 1.20.0); `frontend/package.json` (next 16.4.0, react 19.3.0, katex ^0.19.0).
- Схема БД: `backend/migrations/versions/32b21a07d4ef_initial_schema.py` + модели `backend/app/domains/*/models.py`.
- API статей: `backend/app/domains/articles/{router,schemas,service}.py`.
- Блоки общие со задачами: `backend/app/domains/tasks/schemas.py:11-44`,
  переиспользованы в `articles/schemas.py:9-22`.
- Проверка ответа/прогресс: `solutions/service.py`, `progress/service.py`,
  `solutions/router.py`.
- Страница статьи: `frontend/src/app/(public)/articles/[slug]/page.tsx`.
- Рендер блоков: `frontend/src/features/articles/components/article-body.tsx`.
- Интерактив-прецеденты: `answer-form.tsx`, `diagnostics-runner.tsx`,
  `derivative-graph.tsx`/`derivative-viz.tsx`.
- SEO: `frontend/src/lib/seo/{metadata,json-ld}.ts`, `frontend/src/app/{sitemap,robots}.ts`.

*Тесты не запускались в этой итерации — отчёт не утверждает обратного.*
