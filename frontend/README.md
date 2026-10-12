# Математика и информатика — банк задач и занятия

SEO-ориентированный фронтенд русскоязычной образовательной платформы: банк
задач по математике и информатике с ответами и пошаговыми решениями, статьи с
разборами и страница индивидуальных занятий.

Проект вырос из единого HTML-прототипа (`../ideal.html`), который сохранён в
репозитории как исходный дизайн-референс. План миграции и отчёт о том, что
именно было перенесено, — в [`docs/migration-plan.md`](docs/migration-plan.md).

## Стек

| Слой         | Технология                                     |
| ------------ | ---------------------------------------------- |
| Фреймворк    | Next.js 16 (App Router, Turbopack)             |
| UI           | React 19, Server Components по умолчанию       |
| Язык         | TypeScript (strict, без `any`)                 |
| Стили        | Tailwind CSS 4 + дизайн-токены из прототипа    |
| UI-примитивы | shadcn-подход + Radix UI (Dialog, Label, Slot) |
| Иконки       | Lucide React                                   |
| Формулы      | KaTeX, рендер на сервере                       |
| Формы        | React Hook Form + Zod                          |
| Тесты        | Vitest + React Testing Library, Playwright     |
| Качество     | ESLint 9, Prettier                             |
| Пакеты       | pnpm                                           |

`@tanstack/react-query` в MVP **не используется**: публичные страницы
рендерятся на сервере, реального клиент-серверного обмена данными пока нет.
Библиотека подключается тогда, когда появится API и клиентская инвалидация
кэша (см. [`docs/architecture.md`](docs/architecture.md)).

## Требования

- Node.js 22 LTS или новее
- pnpm 10 или новее (`corepack enable`)

## Установка и запуск

```bash
pnpm install
cp .env.example .env.local   # при необходимости
pnpm dev                     # http://localhost:3000
```

Production-сборка:

```bash
pnpm build
pnpm start                   # http://localhost:3000
```

## Команды

| Команда           | Что делает                                          |
| ----------------- | --------------------------------------------------- |
| `pnpm dev`        | Dev-сервер с горячей заменой                        |
| `pnpm build`      | Production-сборка                                   |
| `pnpm start`      | Запуск собранного приложения                        |
| `pnpm lint`       | ESLint                                              |
| `pnpm typecheck`  | `next typegen && tsc --noEmit`                      |
| `pnpm test`       | Модульные и компонентные тесты (Vitest)             |
| `pnpm test:watch` | Тесты в watch-режиме                                |
| `pnpm test:e2e`   | Сквозные тесты (Playwright; требуется `pnpm build`) |
| `pnpm format`     | Prettier с сортировкой Tailwind-классов             |

Перед первым запуском e2e-тестов нужно установить браузер:

```bash
pnpm exec playwright install chromium
```

## Переменные окружения

Все переменные перечислены в [`.env.example`](.env.example). Секретов в
репозитории нет, для публичных значений используется префикс `NEXT_PUBLIC_`.

| Переменная                   | Назначение                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`       | Абсолютный домен для canonical, sitemap и Open Graph. По умолчанию `http://localhost:3000`. |
| `NEXT_PUBLIC_TUTOR_NAME`     | Имя преподавателя для бренда. Пусто → «Математика · Информатика».                           |
| `NEXT_PUBLIC_TUTOR_TELEGRAM` | Telegram (`@handle` или ссылка).                                                            |
| `NEXT_PUBLIC_TUTOR_EMAIL`    | E-mail для заявок.                                                                          |
| `API_BASE_URL`               | Базовый URL FastAPI для серверных запросов.                                                 |
| `NEXT_PUBLIC_API_BASE_URL`   | Базовый URL API для браузера.                                                               |

> В исходном прототипе были заглушки `Имя Фамилия` и `@username (добавить)`.
> Они удалены: пока переменные пусты, интерфейс скрывает соответствующие блоки
> вместо показа вымышленных данных. Форма заявки на `/podgotovka` появляется,
> когда задан хотя бы один канал связи или адрес API.

## Источник контента

Пока Python-бэкенда нет, задачи и статьи берутся из локальных наборов в
`src/features/*/fixtures/`. Все ответы проверены вручную, а сами наборы явно
помечены `isDemo: true` и показываются в интерфейсе как демонстрационные.

Переключение на реальный API происходит автоматически: функции
`getTasks`/`getArticles` проверяют `API_BASE_URL` и вызывают FastAPI, когда он
задан. Подробности — в [`docs/architecture.md`](docs/architecture.md).

## Структура каталогов

```text
src/
├── app/
│   ├── (public)/            # публичные маршруты (layout с header/footer)
│   │   ├── page.tsx         # главная
│   │   ├── zadachi/         # каталог и страница задачи
│   │   ├── articles/        # список статей и страница статьи
│   │   ├── matematika/      # тематический хаб
│   │   ├── informatika/     # тематический хаб
│   │   ├── podgotovka/      # занятия + форма заявки
│   │   └── error.tsx
│   ├── layout.tsx           # html/body, шрифты, metadataBase
│   ├── not-found.tsx        # 404
│   ├── robots.ts
│   ├── sitemap.ts
│   └── globals.css          # дизайн-токены и общие классы
├── components/
│   ├── layout/              # Container, Section, Header, Footer, MobileNav, PageHero
│   ├── seo/                 # Breadcrumbs, JsonLd
│   └── ui/                  # Button, Badge, Input, Textarea, Label, Math, RichText, …
├── features/
│   ├── home/                # секции главной страницы
│   ├── tasks/               # типы, данные, компоненты задач
│   ├── articles/            # типы, данные, компоненты статей
│   ├── topics/              # шаблон тематического хаба
│   └── tutor-leads/         # заявки и описание занятий
└── lib/
    ├── api/                 # транспортный слой (config/server/client/errors)
    ├── constants/           # конфигурация сайта и навигации
    ├── seo/                 # metadata и JSON-LD
    └── utils/               # cn, check-answer, format, url, hooks
```

Подробнее о правилах раскладки кода — в [`docs/architecture.md`](docs/architecture.md).
