# Архитектура фронтенда

Документ описывает **фактически реализованную** архитектуру, а не желаемую.
Всё, что описано ниже, есть в репозитории и проверяется командами из
[`README.md`](../README.md).

## 1. Архитектурные принципы

1. **Сервер по умолчанию.** Каждая страница — Server Component. Контент
   (условия задач, формулы, решения, тексты статей) присутствует в HTML-ответе
   и доступен поисковым системам и пользователям без JavaScript.
2. **Клиент — только там, где нужен.** `"use client"` стоит ровно там, где есть
   состояние, обработчики событий или браузерные API. Список закрытый (см. §4).
3. **Одна ответственность на модуль.** Транспорт (HTTP) отделён от доменных
   данных, доменные данные — от представления.
4. **Нет абстракций «на будущее».** Например, `@tanstack/react-query` не
   подключён, потому что клиентского обмена данными пока нет.
5. **Прогрессивное улучшение.** Анимации и интерактив — надстройка; базовый
   контент читается без JavaScript.
6. **Никаких вымышленных данных.** Если данные неизвестны (имя преподавателя,
   контакты, отзывы), блок либо настраивается через окружение, либо скрывается.

## 2. Назначение каталогов

| Каталог                  | Ответственность                                                                                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app`                | Маршруты, layouts, `generateMetadata`, `generateStaticParams`, SEO-файлы (`robots.ts`, `sitemap.ts`), обработка ошибок и 404, композиция страниц из компонентов фич. |
| `src/components/layout`  | Каркас: `Container`, `Section`, `SiteHeader`, `MobileNav`, `SiteFooter`, `PageHero`. Без доменной логики.                                                            |
| `src/components/ui`      | Переиспользуемые UI-примитивы: `Button`, `Badge`, `Input`, `Textarea`, `Label`, `Math`, `RichText`, `StateMessage`, `DemoNotice`, `ScrollReveal`.                    |
| `src/components/seo`     | Общие SEO-компоненты: `Breadcrumbs`, `JsonLd`.                                                                                                                       |
| `src/features/<feature>` | Всё про конкретную область: типы, доступ к данным (`api.ts`), фикстуры (`fixtures/`), компоненты (`components/`). Публичный API фичи — `index.ts`.                   |
| `src/lib/api`            | Транспортный слой: конфигурация URL, серверный и клиентский `fetch`, нормализация ошибок, задел под генерацию типов из OpenAPI.                                      |
| `src/lib/seo`            | `buildMetadata`, `absoluteUrl`, генераторы JSON-LD.                                                                                                                  |
| `src/lib/constants`      | Конфигурация сайта и навигации.                                                                                                                                      |
| `src/lib/utils`          | Чистые утилиты (`cn`, `check-answer`, `format`, `url`) и клиентские хуки.                                                                                            |

**Правило зависимостей:** `app → features → components → lib`. Обратные
зависимости и циклы запрещены. `lib` не знает о `features`; временный источник
контента спрятан внутри `features/<feature>/api.ts`.

## 3. Server Components и клиентские компоненты

Клиентских модулей всего восемь, каждый обоснован:

| Компонент                                       | Почему клиентский                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| `features/home/components/task-quiz.tsx`        | Состояние ответа и отложенное раскрытие шагов.                           |
| `features/home/components/code-demo.tsx`        | Пошаговая анимация набора кода и прогон цикла (`setTimeout`, состояние). |
| `features/home/components/hero-parallax.tsx`    | Параллакс по `scroll` через `requestAnimationFrame`.                     |
| `features/tasks/components/answer-form.tsx`     | Ввод ответа, проверка, раскрытие решения.                                |
| `features/tutor-leads/components/lead-form.tsx` | Форма: React Hook Form + Zod, состояние отправки.                        |
| `components/layout/site-header.tsx`             | Класс `scrolled` по событию прокрутки.                                   |
| `components/layout/mobile-nav.tsx`              | Radix Dialog: фокус-трап, Escape, возврат фокуса.                        |
| `components/ui/scroll-reveal.tsx`               | Один `IntersectionObserver` на всю страницу для класса `.reveal`.        |
| `components/ui/label.tsx`                       | Обёртка над Radix Label (нужен клиентский контекст).                     |

Вспомогательно: `lib/utils/use-prefers-reduced-motion.ts` — хук на
`useSyncExternalStore`.

Три ключевых приёма, которые позволяют держать клиентский JS маленьким:

- **KaTeX рендерится на сервере.** `components/ui/math.tsx` вызывает
  `katex.renderToString` в Server Component: формулы приходят готовым HTML, без
  CDN и без лишнего веса в бандле.
- **Hero-график считается на сервере.** Путь кривой и координаты касательной
  вычисляются в `derivative-viz.tsx` и уезжают в HTML как статический SVG;
  анимация — чистый CSS.
- **Серверные данные передаются в клиент как React-узлы.** `TaskQuiz` получает
  уже отрендеренные формулы в пропсах `prompt`, `formula`, `steps[].content`.

### Прогрессивное улучшение

Класс `js` добавляется на `<html>` крошечным inline-скриптом в корневом
layout. На нём построены две вещи:

- `.reveal` скрывает контент **только** при наличии `js`, поэтому без
  скриптов всё видно сразу;
- переключатель `.js-only` / `.no-js-only` даёт каждой интерактивной секции
  статичную версию: решение задачи открыто, листинг Python показан целиком,
  неработающие кнопки викторины скрыты и заменены текстовой подсказкой.

Проверяется тестом `tests/e2e/no-js.spec.ts` с отключённым JavaScript.

## 4. Работа с API

```
src/lib/api/
├── config.ts       # NEXT_PUBLIC_API_BASE_URL, timeout, joinUrl (клиент-безопасно)
├── server.ts       # import "server-only"; API_BASE_URL; serverRequest<T>()
├── client.ts       # clientRequest<T>() для браузера
├── errors.ts       # ApiError + describeApiError() с русскими текстами
└── generated/      # сюда генерируются типы из OpenAPI (пока только README)
```

- Адрес API задаётся только переменными окружения; секреты не попадают в
  клиентский бандл (`serverBaseUrl` живёт в модуле с `import "server-only"`).
- Ошибки нормализуются в `ApiError` с полем `kind`
  (`unconfigured | network | timeout | http | unknown`), интерфейс показывает
  человекочитаемый текст через `describeApiError`.
- Формат доменных данных описан один раз — в `features/<feature>/types.ts`.
  После появления FastAPI типы генерируются из `openapi.json`
  (`openapi-typescript`) и маппятся на эти доменные типы, чтобы не было двух
  источников истины.

### Как сейчас переключается источник данных

`features/tasks/api.ts` и `features/articles/api.ts` — единственное место, где
принимается решение:

```ts
if (isServerApiConfigured()) {
  const response = await serverRequest<TaskListDto>("/tasks", { searchParams: { … } });
  return { items: response.items, … };
}
return listLocalTasks(filters, page); // локальные фикстуры
```

Пока `API_BASE_URL` пустой, работает локальный демонстрационный набор. Как
только переменная задана, тот же код уходит в FastAPI — страницы и компоненты
не меняются.

### Задел на Python/FastAPI

- `GET /tasks?subject&level&page&page_size` → `{ items, total, page, page_size }`
- `GET /tasks/{id}`, `GET /tasks/{id}/related?limit`
- `GET /articles`, `GET /articles/{slug}`
- `POST /tutor-leads` ← `TutorLeadInput` из `features/tutor-leads/types.ts`

Локальный запуск вместе с бэкендом, CORS и CORS-заголовки описаны в
[`next-steps.md`](next-steps.md).

## 5. Типизация

- `strict: true`, `any` не используется.
- Доменные типы лежат рядом с фичей (`features/tasks/types.ts`,
  `features/articles/types.ts`), а не в глобальном `types/`.
- Состояния дискретных UI-элементов выражаются `data-*`-атрибутами, а не
  набором классов: `data-state="right|wrong"`, `data-open`, `data-reveal-in`.
- Валидация формы описана один раз схемой Zod
  (`features/tutor-leads/schema.ts`) и выводится в тип через `z.infer`.

## 6. Стратегия SEO

| Механизм                 | Реализация                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| Метаданные               | `lib/seo/metadata.ts` → `buildMetadata()` для каждой страницы                                  |
| `metadataBase`           | Корневой layout, из `NEXT_PUBLIC_SITE_URL`                                                     |
| Canonical                | Абсолютный URL на каждой странице; фильтры каталога канонизируются на `/zadachi`               |
| Open Graph / Twitter     | Заполняются всегда; `og:image` **не выводится**, пока нет реального изображения 1200×630       |
| robots.txt               | `app/robots.ts`                                                                                |
| sitemap.xml              | `app/sitemap.ts` — только реально существующие маршруты                                        |
| Семантика                | Один `<h1>` на страницу, упорядоченные `h2`/`h3`, `main`, `nav`, `footer`, `figure/figcaption` |
| Хлебные крошки           | `components/seo/breadcrumbs.tsx` + `BreadcrumbList` JSON-LD                                    |
| Структурированные данные | `WebSite`, `BreadcrumbList`, `Article`, `LearningResource`                                     |
| 404                      | Реальный HTTP 404 (`notFound()` в динамических маршрутах)                                      |
| Черновые страницы        | `buildMetadata({ noIndex: true })` для отсутствующих сущностей                                 |
| Рендеринг                | SSG для главной, хабов, статей и задач; SSR для каталога (зависит от `searchParams`)           |

Гарантируется техническая основа для индексации, а не позиции в выдаче.

## 7. Кеширование

- Контентные страницы (`/`, `/matematika`, `/informatika`, `/articles`,
  `/articles/[slug]`, `/zadachi/[id]`, `/podgotovka`) пререндерятся на этапе
  сборки (`○ Static` / `● SSG`).
- `/zadachi` зависит от `searchParams` и рендерится на сервере по запросу; список
  отдаётся внутри `Suspense`, поэтому оболочка страницы стримится сразу.
- **Cache Components (PPR) намеренно отключены** (`cacheComponents: false` в
  `next.config.ts`). При включённом PPR неизвестные динамические параметры
  (`/zadachi/<несуществующий>`) отдавали HTTP 200 с телом страницы 404 —
  «мягкий 404», вредный для SEO. Обычный рендеринг даёт корректный статус 404 и
  при этом сохраняет стриминг через `Suspense`.
- Когда появится API, кеширование включается тегами: `serverRequest` уже
  принимает `tags`, что позволяет использовать `revalidateTag` для
  инвалидации после правок контента.

## 8. Правила расширения

1. **Новая страница.** Создайте маршрут в `src/app/(public)/…`, метаданные — через
   `buildMetadata()`, разметку — из компонентов `components/layout` и `features`.
2. **Новая фича.** Отдельный каталог `src/features/<feature>` с `types.ts`,
   `api.ts`, `components/`, `index.ts`. Импортировать её можно только через
   `index.ts`.
3. **Новый UI-примитив.** Только если он переиспользуется в двух и более местах;
   иначе — локальный компонент фичи.
4. **Новый интерактивный элемент.** Сначала проверьте, можно ли обойтись CSS
   (как в hero-визуализации). Если нужен клиент — держите его как можно меньше и
   передавайте серверные данные React-узлами.
5. **Новые данные.** Расширяйте `api.ts` и `types.ts` фичи; не вызывайте `fetch`
   напрямую из компонентов.
6. **Стили.** Новые значения — в токены `@theme` в `globals.css`. Уникальные
   секции — собственными классами, не подгонкой под шаблон UI-библиотеки.

## 9. Тестирование

| Уровень    | Файлы                                                                                                       | Что покрыто                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Unit       | `lib/utils/check-answer.test.ts`, `features/tasks/search-params.test.ts`, `features/home/lib/task5.test.ts` | Нормализация ответов, парсинг фильтров, эталонный алгоритм задачи 5 и подсветка кода |
| Fixtures   | `features/content-fixtures.test.ts`                                                                         | Целостность демонстрационных наборов, генерация оглавления                           |
| Компоненты | `features/tasks/components/answer-form.test.tsx`, `features/home/components/task-quiz.test.tsx`             | Проверка ответа, подсказки, раскрытие решения, повтор                                |
| E2E        | `tests/e2e/{home,navigation,task-page,seo,no-js}.spec.ts`                                                   | Smoke главной, интерактив, фильтры, ссылки, адаптив, 404, SEO-теги, работа без JS    |

E2E запускаются в двух проектах: `desktop` (1440×900) и `mobile` (Pixel 7).
