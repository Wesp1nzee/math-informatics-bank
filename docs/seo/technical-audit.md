# Technical SEO audit

Date: 2026-10-20
Environment: local frontend (`http://localhost:3000` dev, `http://127.0.0.1:3210`
production build), local FastAPI (`http://localhost:8000`), SQLite
`backend/site_bank.db`.

This audit covers what can be verified locally. Yandex Webmaster, Google Search
Console, external validators and real Core Web Vitals field data were not
available; those items are listed in section 8.

## 1. Baseline before changes

| Check | Result |
| --- | --- |
| Frontend production build | passed |
| Backend tests | 89 passed |
| Frontend unit tests | 137 passed |
| `/`, `/matematika`, `/informatika`, `/zadachi`, `/articles`, `/podgotovka`, `/diagnostika`, `/privacy` | 200 |
| `/nonexistent` | 404 |
| SSR article body | present; KaTeX HTML present |
| robots.txt | 200, `Sitemap:` present |
| sitemap.xml | 200, 23 URLs |
| Canonical | present on public pages |
| Article exercise answers in HTML | not found |

The baseline already had the key SEO infrastructure. The defects below were found
while adding the first content queue and checking production-like behaviour.

## 2. Defects found and fixed

### D1. Unknown task/article URLs returned 500 instead of 404

- **URL/component:** `/zadachi/does-not-exist`, `/articles/does-not-exist`.
- **Problem:** the routes used `generateStaticParams` plus a runtime `no-store`
  fetch. Next.js treated the on-demand render as a dynamic usage on a static route
  and returned 500 (`DYNAMIC_SERVER_USAGE`).
- **Impact:** critical for SEO and UX: a missing page is not a valid 404, and
  crawlers can see a server error. Violates the requirement "unknown URL returns
  404, not 200/500".
- **Fix:** article and task detail routes are now rendered on demand
  (`export const dynamic = "force-dynamic"`); `generateStaticParams` was removed
  from these two routes. New editorially published slugs/ids work without a rebuild.
- **Re-check:** `/zadachi/does-not-exist` → 404; `/articles/nope` → 404;
  `/zadachi/1` → 200; `/articles/...` → 200. Covered by
  `tests/e2e/seo-pages.spec.ts`.

### D2. Static home and subject hubs could bake demo/stale links

- **URL/component:** `/`, `/matematika`, `/informatika`.
- **Problem:** these pages were prerendered at build time. If the API was not
  reachable during the Docker build, they fell back to demo fixtures and baked
  links such as `/zadachi/1042` or stale task ids. After seeding, the static page
  still pointed to a task with a different answer.
- **Impact:** critical for internal linking and UX; a "Попробовать задачу" link
  could lead to a 404 or to a different task.
- **Fix:** `dynamic = "force-dynamic"` on the home page and subject hubs; the API
  client now uses `cache: "no-store"` for runtime requests (while allowing the
  normal cache during `next build` so SSG routes can be generated).
- **Re-check:** production home renders `href="/zadachi/1"` (the real featured
  task) and e2e task tests pass. The first e2e run failed because a stale
  `next-server` process was still serving the old build; after killing it and
  restarting, the link and the answer check were correct.

### D3. Duplicate meta descriptions on task hubs

- **URL/component:** `/matematika/oge/zadaniya` vs `/matematika/ege/zadaniya`;
  `/informatika/oge/zadaniya` vs `/informatika/ege/zadaniya`.
- **Problem:** both pages in each pair used the same description.
- **Impact:** medium: duplicate snippets reduce differentiation in SERP.
- **Fix:** exam-specific descriptions in the route `generateMetadata`.
- **Re-check:** crawl of 45 sitemap URLs: 45 unique titles, 45 unique descriptions.

### D4. Duplicate URL for SEO task-type articles

- **URL/component:** `/articles/seo-matematika-oge-zadanie-6` and the other 8 SEO
  article slugs.
- **Problem:** task-type pages are stored as `ArticleContent v2` records so they
  can use the existing renderer and server-side exercise checking. The generic
  `/articles/{slug}` route would expose a second URL with the same content.
- **Impact:** high: duplicate content and cannibalisation.
- **Fix:** `permanentRedirect` (308) from the internal slug to the canonical public
  path; SEO slugs are excluded from the article list, related-article blocks,
  `generateStaticParams` and `sitemap.xml`.
- **Re-check:** `/articles/seo-matematika-oge-zadanie-6` → 308 with
  `Location: /matematika/oge/zadanie-6`; sitemap contains no `/articles/seo-`.

### D5. Home canonical and sitemap home URL differed by a trailing slash

- **URL/component:** `/` canonical `http://localhost:3000` vs sitemap
  `http://localhost:3000/`.
- **Problem:** inconsistent URL form for the same page.
- **Impact:** low, but avoidable.
- **Fix:** sitemap home URL uses `siteConfig.url` without the trailing slash.
- **Re-check:** canonical and sitemap now use the same form.

### D6. Local CORS defaults did not include the Playwright port

- **Component:** `backend/app/core/config.py` default `cors_origins`.
- **Problem:** Playwright runs the frontend on `127.0.0.1:3210`; the default CORS
  list only had ports 3000. Task answer checks failed with "Нет связи с сервером"
  in e2e, although the API was healthy.
- **Impact:** test-environment defect, not a production SEO defect, but it hid a
  real answer-check regression.
- **Fix:** added `http://localhost:3210` and `http://127.0.0.1:3210` to the
  development defaults. Production validation still rejects localhost origins.
- **Re-check:** `POST /api/v1/tasks/1/check` with `Origin: http://127.0.0.1:3210`
  returns `access-control-allow-origin`; all 92 existing e2e tests pass.

## 3. Checks that passed

### 3.1. Server HTML without JavaScript

Checked with `curl` (no browser JS) and with Playwright `javaScriptEnabled: false`.

| Page type | Title | Description | Canonical | H1 | Body text / formulas | Links |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | yes | yes | yes | yes | yes | `<a href>` |
| `/matematika`, `/informatika` | yes | yes | yes | yes | yes | `<a href>` |
| `/matematika/oge`, `/informatika/ege` | yes | yes | yes | yes | yes | `<a href>` |
| task hubs | yes | yes | yes | yes | yes | `<a href>` |
| task-type pages | yes | yes | yes | yes | yes, KaTeX HTML | `<a href>` |
| `/articles/{slug}` | yes | yes | yes | yes | yes, KaTeX HTML | `<a href>` |
| `/zadachi/{id}` | yes | yes | yes | yes | yes, KaTeX HTML | `<a href>` |

Examples:

- `/matematika/oge/zadanie-6` production HTML: 205,459 bytes, contains
  "Порядок действий", "Проверьте себя", 3 KaTeX fragments.
- `/articles/formuly-sokrashchennogo-umenozheniya` production HTML: 250,437 bytes,
  full article body and formulas.
- No page is an empty `<div id="root">`; the main text is in the initial HTML.

### 3.2. Indexing

| Check | Result |
| --- | --- |
| `robots.txt` | 200; `User-Agent: *`, `Allow: /`, `Disallow: /api/`, `Host`, `Sitemap` |
| `sitemap.xml` | 200; 45 URLs |
| Sitemap includes new SEO pages | yes |
| Sitemap excludes `/articles/seo-*` | yes |
| Sitemap excludes drafts | yes; only `is_published=True` articles and tasks |
| Sitemap URLs return 200 | yes (crawl of all 45 URLs) |
| Public pages have accidental `noindex` | no (checked `<meta name="robots">`) |
| 404 page has `noindex` | yes |
| Canonical equals the page URL | yes for all sitemap URLs |
| Redirects | 308 for internal SEO article aliases; no loops found |
| Important pages available without auth | yes |

### 3.3. Statuses and routing

- `/zadachi/{valid}` → 200.
- `/zadachi/{unknown}` → 404.
- `/articles/{valid}` → 200.
- `/articles/{unknown}` → 404.
- `/matematika/oge/zadanie-6` → 200.
- `/matematika/oge/zadanie-99` → 404.
- `/matematika/foo` → 404 (`dynamicParams = false` on exam hubs).
- `/informatika/ege/zadanie-2/extra` → 404.
- No 5xx observed on the checked public URLs after the fixes.

### 3.4. Structured data

| Page | JSON-LD | Valid JSON | Matches visible content |
| --- | --- | --- | --- |
| `/` | `WebSite`, `FAQPage` | yes | FAQ is visible on the page |
| `/matematika/oge` | `BreadcrumbList` | yes | breadcrumbs visible |
| task hubs | `BreadcrumbList` | yes | breadcrumbs visible |
| task-type pages | `BreadcrumbList`, `Article` | yes | headline/description match |
| `/articles/{slug}` | `Article` | yes | headline/description match |
| `/zadachi/{id}` | `LearningResource` | yes | name/description match |
| `/podgotovka` | `Service`, `Person` (when configured), `FAQPage` | yes | only real tutor data from env; no invented reviews |

No `Review`, `Rating`, `Course`, `Product` or fake `FAQPage` markup was added.

### 3.5. Internal links

- All 45 sitemap URLs are reachable from `/` (62 internal URLs found); no orphan
  pages among the first queue.
- A crawl of the 45 sitemap pages and their internal links found no 404/500.
- Internal links use real `<a href="...">`, not JavaScript-only navigation.
- Breadcrumbs are visible and mirrored in JSON-LD.

### 3.6. Exercise answers

- `GET /api/v1/articles/seo-matematika-oge-zadanie-6` returns `content` without
  `correct_option_id`, `correct_value` or `explanation`.
- The HTML of `/matematika/oge/zadanie-6` contains no `correct_option_id`,
  `correct_value` or `"correct"`.
- `POST /api/v1/articles/seo-matematika-oge-zadanie-6/exercises/oge6-choice-1/check`
  with `{"answer":"b"}` returns `isCorrect: true` and the explanation only after
  the correct answer.
- `POST .../oge6-num-1/check` with `{"answer":"7"}` returns `isCorrect: true`.
- Playwright confirms the choice and numeric exercises work in the browser.

**Task bank distinction:** `/zadachi/{id}` intentionally publishes the answer and
solution as the product (a solution bank). The `expected` value is also used by the
client fallback when no public API is configured. This is an intentional product
decision, not an article-exercise answer leak. If the product later makes task
solutions paywalled, the solution panel must be fetched on demand; until then, it
is public educational content.

### 3.7. Mobile and accessibility

Playwright checks at 390×844 and 1440×900:

- no horizontal overflow on `/matematika/oge`, `/matematika/ege`,
  `/informatika/oge`, `/informatika/ege`, `/matematika/oge/zadaniya`,
  `/matematika/oge/zadanie-6`, `/matematika/oge/zadanie-11`,
  `/informatika/ege/zadanie-2`, `/articles/formuly-sokrashchennogo-umenozheniya`;
- one H1 per page;
- no console errors;
- the interactive graph on `/matematika/oge/zadanie-11` renders one
  `svg[role="img"]` and two range inputs;
- the choice and numeric exercises can be completed; "Верно." and the explanation
  appear;
- keyboard focus reaches buttons and inputs; radio options are inside labels;
- `prefers-reduced-motion: reduce` was emulated during the interaction test; no
  errors.

### 3.8. Performance (limited)

- Production HTML sizes: home 162 KB, exam hub 104 KB, task-type page 205 KB,
  article 250 KB. These are not JS bundle sizes and include content.
- `interactive-graph` is dynamically imported with `ssr: false` by
  `interactive-graph-loader.tsx`, so the heavy graph component is not part of the
  initial bundle of pages without a graph.
- `next build` output is `output: "standalone"`.
- Core Web Vitals were **not** measured with Lighthouse or field data. Do not claim
  good CWV without a real measurement.

## 4. Test evidence

| Command | Result |
| --- | --- |
| `uv run pytest -q` | 94 passed |
| `pnpm typecheck` | passed |
| `pnpm lint` | passed |
| `pnpm test` | 145 passed |
| `pnpm build` | passed; 39 static/SSG pages plus dynamic routes |
| `pnpm test:e2e` | 144 passed (desktop + mobile), including the new SEO spec |
| `pnpm exec playwright test tests/e2e/seo-pages.spec.ts --project=desktop` | 26 passed |
| crawl of sitemap URLs | 45/45 HTTP 200; no broken internal links |
| metadata uniqueness crawl | 45 unique titles, 45 unique descriptions |

## 5. Deployment checks that remain

1. Set `NEXT_PUBLIC_SITE_URL` to the real HTTPS origin; `check:deploy` rejects
   localhost in production.
2. Set `NEXT_PUBLIC_API_BASE_URL` / `API_BASE_URL` to the real API origin; Caddy
   should route `/api/*` to FastAPI.
3. Run `python -m scripts.seed` in the API container after migrations.
4. Rebuild the `web` image only when frontend code or `NEXT_PUBLIC_*` values
   change; editorial pages and the sitemap read the API at runtime.
5. Submit `https://<domain>/sitemap.xml` to Yandex Webmaster and Google Search
   Console.
6. Check the real domain with Yandex Webmaster, GSC URL Inspection and a
   Lighthouse/CrUX run.
7. Confirm that Yandex Metrika and the lead form are connected; do not invent
   analytics data before that.

## 6. Known limitations

- No access to Yandex Webmaster, Google Search Console, Yandex Metrika or external
  validators; indexing and positions cannot be confirmed locally.
- Core Web Vitals field data was not available; only basic size/lazy-load checks
  were performed.
- The production domain is not deployed in this environment; all HTTP checks are
  local.
- Task-bank solutions are public by design (see 3.6).
- `pnpm start` prints a warning because the project uses `output: "standalone"`;
  production runs `node server.js`, so this warning does not affect deployment.
