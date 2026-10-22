# Publication report: first SEO queue

Date: 2026-10-20
Scope: first 30 target URLs from `docs/seo/content-plan.md`.

## 1. What was actually done

- Read the existing SEO research in `/home/aleksey/wordstat/seo_research`
  (`seo_business_plan.md`, `final_report.md`, `mvp_pages.csv`, `page_map.csv`,
  `cannibalization.csv`, clusters/keywords, phase 2/3 queues, forecast and
  commercial demand).
- Audited the real Next.js/FastAPI application: routes, API contracts,
  `ArticleContent v2`, `ArticleRenderer`, exercise checking, sitemap, robots,
  metadata, 404 handling, tests.
- Created and seeded 14 new `ArticleContent v2` records:
  - 9 task-type pages with worked examples and server-checked exercises;
  - 5 new educational articles (with the 3 existing ones, the regular article set
    is now 8).
- Added 4 exam hubs and 4 task-type hubs with official 2026 structure data.
- Added real internal linking between subject hubs, exam hubs, task hubs,
  task-type pages, articles and task pages.
- Fixed the technical defects listed in `docs/seo/technical-audit.md`.
- Ran backend, frontend unit, build and e2e checks; crawled the sitemap and
  internal links.

The production domain was **not** deployed from this environment. "Published" below
means: the record is `is_published=True` in the local `site_bank.db`, the page is
served by the running application, and it is present in the local sitemap. The
production deployment needs the commands in section 5.

## 2. New URLs

| # | URL | Type | Status | Main checks |
| --- | --- | --- | --- | --- |
| 1 | `/matematika/oge` | exam hub | published (static route) | 200, SSR, canonical, breadcrumbs, sitemap, mobile |
| 2 | `/matematika/ege` | exam hub | published (static route) | 200, SSR, canonical, breadcrumbs, sitemap, mobile |
| 3 | `/informatika/oge` | exam hub | published (static route) | 200, SSR, canonical, breadcrumbs, sitemap, mobile |
| 4 | `/informatika/ege` | exam hub | published (static route) | 200, SSR, canonical, breadcrumbs, sitemap, mobile |
| 5 | `/matematika/oge/zadaniya` | task hub | published (static route) | 200, SSR, unique description, sitemap |
| 6 | `/matematika/ege/zadaniya` | task hub | published (static route) | 200, SSR, unique description, sitemap |
| 7 | `/informatika/oge/zadaniya` | task hub | published (static route) | 200, SSR, unique description, sitemap |
| 8 | `/informatika/ege/zadaniya` | task hub | published (static route) | 200, SSR, unique description, sitemap |
| 9 | `/matematika/oge/zadanie-6` | task type | published (article `seo-matematika-oge-zadanie-6`) | 200, SSR, 2 exercises, answer key stripped, sitemap |
| 10 | `/matematika/oge/zadanie-11` | task type | published (article `seo-matematika-oge-zadanie-11`) | 200, SSR, graph + 2 exercises, answer key stripped, sitemap |
| 11 | `/matematika/oge/zadanie-15` | task type | published (article `seo-matematika-oge-zadanie-15`) | 200, SSR, 2 exercises, answer key stripped, sitemap |
| 12 | `/matematika/oge/zadanie-19` | task type | published (article `seo-matematika-oge-zadanie-19`) | 200, SSR, 2 exercises, answer key stripped, sitemap |
| 13 | `/informatika/oge/zadanie-5` | task type | published (article `seo-informatika-oge-zadanie-5`) | 200, SSR, 2 exercises, answer key stripped, sitemap |
| 14 | `/informatika/ege/zadanie-2` | task type | published (article `seo-informatika-ege-zadanie-2`) | 200, SSR, 2 exercises, answer key stripped, sitemap |
| 15 | `/informatika/ege/zadanie-4` | task type | published (article `seo-informatika-ege-zadanie-4`) | 200, SSR, 2 exercises, answer key stripped, sitemap |
| 16 | `/informatika/ege/zadanie-5` | task type | published (article `seo-informatika-ege-zadanie-5`) | 200, SSR, 2 exercises, answer key stripped, sitemap |
| 17 | `/informatika/ege/zadanie-8` | task type | published (article `seo-informatika-ege-zadanie-8`) | 200, SSR, 2 exercises, answer key stripped, sitemap |
| 18 | `/articles/formuly-sokrashchennogo-umenozheniya` | article | published (DB) | 200, SSR, 2 exercises, unique metadata, sitemap |
| 19 | `/articles/stepeni-i-korni-svojstva` | article | published (DB) | 200, SSR, 2 exercises, unique metadata, sitemap |
| 20 | `/articles/logicheskie-operacii-tablicy-istinnosti` | article | published (DB) | 200, SSR, 2 exercises, unique metadata, sitemap |
| 21 | `/articles/bally-oge-matematika-perevod-v-ocenku` | article | published (DB) | 200, SSR, 2 exercises, source/caveat, sitemap |
| 22 | `/articles/struktura-ege-informatika` | article | published (DB) | 200, SSR, 2 exercises, source/caveat, sitemap |

## 3. Existing URLs included in the first queue

| # | URL | Type | Status | Notes |
| --- | --- | --- | --- | --- |
| 23 | `/podgotovka` | commercial | existing | Reused; one page instead of two `/repetitor/*` URLs. |
| 24 | `/matematika` | subject hub | existing | Added OGE/EGE blocks. |
| 25 | `/informatika` | subject hub | existing | Added OGE/EGE blocks. |
| 26 | `/articles/proizvodnaya-smysl-grafik-kasatelnaya` | article | existing | Not rewritten; linked from EGE hubs. |
| 27 | `/articles/logarifmy-opredelenie-svojstva-oshibki` | article | existing | Not rewritten; linked from EGE hubs. |
| 28 | `/articles/sistemy-schisleniya-perevod-i-lovushki` | article | existing | Not rewritten; linked from informatics hubs. |
| 29 | `/zadachi/1` | task | existing | Template example; answer check works. |
| 30 | `/zadachi/9` | task | existing | Template example; answer check works. |

## 4. Interactivity used

| Page | Blocks | Why |
| --- | --- | --- |
| OGE math 6 | `single_choice`, `numeric_input`, `hint` | Check fraction comparison and order of operations. |
| OGE math 11 | `interactive_graph`, `single_choice`, `numeric_input`, `hint` | Show how `k` and `b` change a line; check point/graph reading. |
| OGE math 15 | `single_choice`, `numeric_input`, `hint` | Check area formula and Pythagoras. |
| OGE math 19 | `single_choice`, `numeric_input`, `hint` | Check true/false statement analysis and angle sum. |
| OGE informatics 5 | `single_choice`, `numeric_input`, `hint` | Check forward and reverse executor problems. |
| EGE informatics 2 | `single_choice`, `numeric_input`, `hint` | Check logic evaluation and truth-table size. |
| EGE informatics 4 | `single_choice`, `numeric_input`, `hint` | Check decoding and minimal code length under Fano. |
| EGE informatics 5 | `single_choice`, `numeric_input`, `hint` | Check forward and reverse algorithms. |
| EGE informatics 8 | `numeric_input`, `single_choice`, `hint` | Check message volume and KiB. |
| Formulas article | `single_choice`, `numeric_input`, `hint` | Check expansion and difference of squares. |
| Powers/roots article | `numeric_input`, `single_choice`, `hint` | Check exponent rules and root simplification. |
| Logic article | `single_choice`, `numeric_input`, `hint` | Check De Morgan and table size. |
| OGE scores article | `single_choice`, `numeric_input` | Check max score and grade-5 threshold. |
| EGE informatics structure | `single_choice`, `numeric_input` | Check duration and max primary score. |

All exercises use the existing `ArticleContent v2` + `ArticleRenderer` +
`POST /api/v1/articles/{slug}/exercises/{id}/check`. No alternative client-side
checker was added. Article exercise answer keys are stripped by
`public_content_from_raw`.

## 5. How to publish to production

The content is in the seed script. In production:

```bash
docker compose --env-file deploy/.env.production -f compose.prod.yaml \
  exec api python -m scripts.seed
```

Editorial pages and the sitemap read the API at runtime, so a `web` rebuild is
needed only when frontend code or `NEXT_PUBLIC_*` values change:

```bash
docker compose --env-file deploy/.env.production -f compose.prod.yaml build web
docker compose --env-file deploy/.env.production -f compose.prod.yaml up -d web
```

The seed is idempotent:

- it upserts articles by slug and tasks by `source_ref`;
- it validates every `ArticleContent v2` document before writing;
- it preserves existing `published_on`/`updated_on` dates and only moves
  `updated_on` when title, description or content changes.

Before production, set the real `NEXT_PUBLIC_SITE_URL` and API origins; `check:deploy`
rejects localhost in production. See `docs/deployment.md`.

## 6. What was not published

- `/matematika/oge/zadanie-10`, `-20` and other task numbers: deferred to phase 2.
- `/blog/...`, `/repetitor/...`, `/matematika/teoriya/...` URLs from the research:
  mapped to the existing `/articles`, `/podgotovka` and task-type routes.
- 2027 "changes" pages: deferred because only draft 2027 documents were available.
- No mass-generated tasks or articles; no invented reviews, prices or results.

## 7. Verification summary

- 45 sitemap URLs, all HTTP 200.
- 45 unique titles, 45 unique descriptions.
- No `/articles/seo-*` in the sitemap; those URLs return 308 to the public path.
- Unknown task/article/task-type URLs return 404.
- No article-exercise answer keys in public HTML/JSON.
- Backend: 94 tests passed.
- Frontend: typecheck, lint, 145 unit tests, build passed.
- E2E: 144 tests passed (desktop + mobile), including the new
  `tests/e2e/seo-pages.spec.ts`.

See `docs/seo/technical-audit.md` for the detailed evidence and limitations.
