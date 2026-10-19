# Развёртывание и переменные окружения

Документ описывает, какие переменные нужны на каждом этапе: при **сборке
frontend**, при **запуске frontend** и при **запуске backend**. Реальные значения
и секреты здесь не приводятся — используйте `.env.example` как шаблон и
секрет-менеджер/переменные окружения хостинга.

## 1. Главное про `NEXT_PUBLIC_*`

- Переменные с префиксом `NEXT_PUBLIC_` **встраиваются в клиентский бандл на
  этапе `next build`**. После изменения такой переменной нужна **пересборка**, а
  не только перезапуск.
- `API_BASE_URL` (без префикса) читается сервером в runtime, но SSG-страницы и
  sitemap используют его и **при сборке**. Поэтому в production он нужен
  **и при сборке, и при запуске**.
- Базовые URL задаются как origin (`https://api.example.com`); префикс `/api/v1`
  добавляется в коде (`frontend/src/lib/api/config.ts`).

## 2. Сборка frontend (`pnpm build`)

| Переменная | Обязательна | Назначение |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | да | Публичный домен сайта, например `https://osnova-lab.ru`. От него зависят canonical, sitemap, robots, OG, JSON-LD. В production — только HTTPS, без localhost, пути и query. |
| `NEXT_PUBLIC_TUTOR_NAME` | да* | Имя преподавателя для бренда и блока «Преподаватель». |
| `NEXT_PUBLIC_TUTOR_ABOUT` | да* | 3–4 строки о преподавателе; вместе с именем включает блок. |
| `NEXT_PUBLIC_TUTOR_TELEGRAM` | да* | Telegram (`@handle` или ссылка) — канал заявки. |
| `NEXT_PUBLIC_TUTOR_EMAIL` | да* | E-mail — канал заявки. |
| `NEXT_PUBLIC_API_BASE_URL` | да* | Origin API для браузерных запросов (форма, проверка ответа). |
| `NEXT_PUBLIC_TUTOR_PHOTO` | нет | Фото преподавателя (URL/путь). |
| `NEXT_PUBLIC_TUTOR_VIDEO` | нет | Ссылка на видео-знакомство. |
| `NEXT_PUBLIC_YM_ID` | нет | Счётчик Яндекс.Метрики; без него аналитика — no-op. |
| `API_BASE_URL` | да, если используется API | Origin API для серверных запросов/SSG. Нужен и при сборке. |

\* Должен быть настроен **хотя бы один** канал заявки:
`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_TUTOR_TELEGRAM` или
`NEXT_PUBLIC_TUTOR_EMAIL`. Иначе форма заявки в production не отображается, а
`TutorLeadPanel` возвращает `null`.

> `NEXT_PUBLIC_TUTOR_NAME` + `NEXT_PUBLIC_TUTOR_ABOUT` включают блок
> «Преподаватель». Без них сайт остаётся с нейтральным брендом.

## 3. Запуск frontend (`pnpm start`)

| Переменная | Назначение |
| --- | --- |
| `API_BASE_URL` | Origin API для SSR и динамических страниц (`/zadachi`, детали). Должен совпадать с тем, что использовался при сборке. |
| `PORT` | Порт, если не 3000 (Playwright использует 3210 через `E2E_PORT`). |

`NEXT_PUBLIC_*` на этом этапе уже «зашиты» в сборку; менять их в runtime
бесполезно — нужна пересборка.

## 4. Запуск backend

| Переменная | Обязательна | Назначение |
| --- | --- | --- |
| `ENV` | да | `prod` в production (влияет на `Secure` cookie и поведение). |
| `DEBUG` | да | `false` в production. |
| `DATABASE_URL` | да | `postgresql+asyncpg://…` для production Postgres. |
| `CORS_ORIGINS` | да | Origin(ы) frontend, например `https://osnova-lab.ru`. |
| `COOKIE_SECURE` | рекомендуется | `true` в production (при `ENV=prod` включается автоматически). |
| `COOKIE_SAMESITE` | рекомендуется | `lax` для same-site; `none` только вместе с CSRF-защитой. |
| `COOKIE_DOMAIN` | при необходимости | Домен cookie для кросс-поддоменной схемы. |
| `IP_HASH_SALT` | да | Секрет для псевдонимизации IP. |
| `TELEGRAM_BOT_TOKEN` | да, если нужны уведомления | Токен бота (не коммитить). |
| `TELEGRAM_ADMIN_CHAT_ID` | да, если нужны уведомления | Чат преподавателя. |
| `LEAD_RATE_LIMIT_PER_HOUR` | нет | Лимит заявок с одного контакта в час (по умолчанию 5). |
| `LOG_LEVEL`, `LOG_JSON` | нет | Логирование. |
| `STORAGE_*`, `ALLOWED_HOSTS` | пока не используются | Оставлены на будущее; `TrustedHostMiddleware` не подключён. |

Секреты (`DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `IP_HASH_SALT`, SMTP и т.п.) не
должны попадать в Git. `.env`/`.env.local` уже в `.gitignore`; используйте
секрет-менеджер хостинга.

## 5. Проверка production-конфигурации frontend

Перед сборкой/деплоем выполните:

```bash
cd frontend
pnpm check:deploy
```

Скрипт `scripts/check-production-env.mjs` в production-режиме:

- падает, если `NEXT_PUBLIC_SITE_URL` не задан, не является абсолютным URL,
  использует не HTTPS, указывает на `localhost`/`127.0.0.1`/`0.0.0.0`, содержит
  учётные данные или путь/query/fragment (нужен чистый origin, например
  `https://osnova-lab.ru`);
- падает, если задан некорректный `NEXT_PUBLIC_API_BASE_URL` (должен быть
  публичный HTTPS-origin) или `API_BASE_URL` (должен быть абсолютным URL;
  внутренний HTTP-адрес допустим);
- падает, если не настроен ни один канал заявки
  (`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_TUTOR_TELEGRAM`,
  `NEXT_PUBLIC_TUTOR_EMAIL`);
- предупреждает, если задан `NEXT_PUBLIC_API_BASE_URL`, но не задан
  `API_BASE_URL` (иначе SSR-страницы уйдут в демо-режим);
- не печатает значения секретов;
- читает `process.env`, затем `.env.production.local`, `.env.local`,
  `.env.production`, `.env` (process env имеет приоритет; более ранний файл
  важнее более позднего).

Для локальной проверки используйте `pnpm check:deploy --local`: в этом режиме
разрешены `http://localhost`, а отсутствие site URL и канала заявки даёт
предупреждение, а не ошибку. `pnpm dev` этот скрипт не запускает.

## 6. Рекомендуемый порядок деплоя

1. Поднять production Postgres и применить миграции:
   `alembic upgrade head` (backend).
2. Запустить backend с production-переменными; проверить
   `GET /api/health`.
3. Во frontend выставить те же production-переменные, что будет использовать
   сборка, и выполнить **до** `build`: `pnpm check:deploy`.
4. Собрать frontend: `pnpm build` (с `NEXT_PUBLIC_*` и `API_BASE_URL`).
5. Запустить frontend: `pnpm start` (с `API_BASE_URL`).
6. Smoke: главная, `/zadachi`, задача, `/articles`, `/podgotovka`, `/privacy`,
   `/robots.txt`, `/sitemap.xml`, 404; отправить тестовую заявку и проверить
   Telegram.

> Если `API_BASE_URL` задан при сборке, SSG-страницы, sitemap и
> `generateStaticParams` обращаются к API. API должен быть доступен **до**
> сборки frontend.

## 7. Предпочтительная схема размещения

Рекомендуется разместить API на том же домене за reverse proxy (например,
`osnova-lab.ru/api/v1` → backend). Тогда:

- не нужен кросс-доменный CORS для браузерных запросов;
- cookie `SameSite=lax` работают без CSRF-токена;
- меньше проблем с canonical/HTTPS.

Если API вынесен на отдельный поддомен/домен, настройте `CORS_ORIGINS`,
`COOKIE_DOMAIN`/`COOKIE_SAMESITE` и (для `SameSite=None`) CSRF-защиту.

## 8. Связанные файлы

- `frontend/.env.example` — шаблон frontend-переменных.
- `backend/.env.example` — шаблон backend-переменных.
- `frontend/scripts/check-production-env.mjs` — проверка deploy-конфигурации.
- `docs/launch-readiness-audit.md` — риски и план перед запуском.
