# Next steps: phase 2 and transition criteria

The first queue is 30 URLs (see `docs/seo/content-plan.md`). Do not publish the
remaining 100+ pages mechanically. Move to phase 2 only when the signals below are
available.

## 1. What to measure after the first queue is live

Minimum setup before judging SEO:

1. Yandex Webmaster and Google Search Console are connected; the sitemap is
   submitted.
2. Yandex Metrika is connected; goals for "task answer checked", "article read",
   "lead form opened", "lead submitted" are configured.
3. A simple weekly report stores: impressions, clicks, CTR, average position,
   indexed URLs, errors, and leads.
4. A content log records which pages were published and when.

Until these exist, there is no factual basis for "SEO works" or "SEO does not
work". Do not use the model traffic from `forecast.json` as a result.

## 2. Transition criteria

Move from the first queue to phase 2 when **all** of these are true:

| Criterion | Target | Why |
| --- | --- | --- |
| Technical health | 0 critical errors in Webmaster/GSC; sitemap accepted; no accidental `noindex` | New pages cannot rank if they are not crawlable. |
| Indexation | at least 60% of the 30 first-queue URLs indexed within 8–12 weeks | A low indexation rate means a structural or quality problem, not a need for more pages. |
| Search demand signal | at least 3 clusters have ≥100 impressions/week and a non-zero CTR | Shows that the topics are visible, not just published. |
| Content quality | at least one page has a meaningful engagement signal (e.g., exercise attempts or time on page) | Confirms the pages are useful, not just indexed. |
| Conversion | at least one lead attributed to an organic landing page (or a clear reason why not) | SEO must connect to the product, not only to traffic. |
| Capacity | the editor can produce 2–4 high-quality pages per week without reusing text | Prevents a mass-generated queue. |
| Cannibalisation | no new page competes with an existing URL for the same intent | Protects the first queue. |

If indexation is low, do not add pages: fix crawlability, internal links, content
uniqueness and the sitemap first. If impressions are low but indexation is high,
review titles/snippets and the query-to-page match before expanding.

## 3. Phase 2 candidates (from the research)

These are candidates, not commitments. Each needs a content outline and a
cannibalisation check before creation.

### Mathematics

| Candidate | Primary query | Exact | Reason / condition |
| --- | --- | ---: | --- |
| `/matematika/oge/zadanie-10` | задание 10 ОГЭ математика | 1081* | Probability; strong standalone topic. Needs checked combinatorics examples. |
| `/matematika/oge/zadanie-20` | задание 20 ОГЭ математика | 1459 | Part 2 equations/inequalities; needs a full written solution and criteria. |
| `/matematika/oge/zadanie-18` | 18 задание ОГЭ математика | 615* | Geometry; can reuse the geometry template only after unique examples. |
| `/matematika/oge/zadanie-16` | 16 задание ОГЭ математика | 548* | Circle geometry; check SERP overlap with task 15/18. |
| `/matematika/ege/zadanie-1` | ЕГЭ 1 задание математика | 255* | Planimetry; good long-tail, but profile task numbering must be confirmed. |
| `/matematika/ege/zadanie-6` | 6 задание ЕГЭ математика | 217* | Equations; needs a distinct angle from existing algebra articles. |
| `/matematika/ege/zadanie-13` | 13 задание ЕГЭ математика | 217* | Part 2 equation; high effort, only with a full solution. |
| `/articles/bally-ege-matematika` | баллы ЕГЭ математика | 761 | Scoring/reference; needs the confirmed 2026/2027 conversion. |
| `/articles/teoriya-ege-matematika` | теория ЕГЭ математика | 82 | Only as a curated hub, not a thin list; link to existing theory. |
| `/articles/planimetriya` | планиметрия ЕГЭ | 435* | Strong geometry theory cluster; needs diagrams and proofs. |

\* exact frequency from `phase2_pages.csv` / `page_map.csv`; check the current
research row before using it in a new plan.

### Informatics

| Candidate | Primary query | Exact | Reason / condition |
| --- | --- | ---: | --- |
| `/informatika/ege/zadanie-7` | задание 7 ЕГЭ информатика | 2584* | Memory for graphics/sound; overlaps task 8/11. Create only if the page focuses on task 7's specific calculations. |
| `/informatika/ege/zadanie-11` | задание 11 ЕГЭ информатика | 2680* | Message volume; overlaps task 8. Decide whether to merge into one "measurement" page or keep separate per SERP. |
| `/informatika/ege/zadanie-14` | задание 14 ЕГЭ информатика | 969* | Number systems; existing systems article is a supporting page, not a task page. |
| `/informatika/ege/zadanie-15` | 15 задание ЕГЭ информатика | 594* | Logic laws; check overlap with task 2. |
| `/informatika/ege/zadanie-16` | 16 задание ЕГЭ информатика | — | Recursion; high effort; needs executable code. |
| `/informatika/ege/zadanie-17` | 17 задание ЕГЭ информатика | — | Programming; high effort; needs a checked program. |
| `/informatika/ege/zadanie-19`–`21` | теория игр | — | A series of game-theory pages; only as a coherent block with a shared method. |
| `/informatika/ege/zadanie-24`–`27` | программирование | — | High-effort programming tasks; publish only with tested code and edge cases. |
| `/informatika/oge/zadanie-7` | задание 7 ОГЭ информатика | 919* | Internet addressing; good standalone topic. |
| `/informatika/oge/zadanie-8` | задание 8 ОГЭ информатика | 807* | Search queries; check overlap with task 7. |
| `/informatika/oge/zadanie-14` | задание 14 ОГЭ информатика | 339* | Spreadsheet; needs a practical task and file/format instructions. |
| `/articles/bally-oge-informatika` | информатика ОГЭ баллы | 1883 | Scoring/reference; same caveats as the math scoring page. |
| `/articles/bally-ege-informatika` | баллы ЕГЭ информатика | 1472 | Could be merged into `/articles/struktura-ege-informatika`; do not create a duplicate. |
| `/articles/izmeneniya-2027` | изменения ЕГЭ/ОГЭ 2027 | 211–470 | **Only after** FIPI publishes the final 2027 documents. Do not publish a draft as final. |

\* exact frequency from `phase2_pages.csv`; verify the row and the user intent
before creating.

### Commercial

- Do **not** create `/repetitor/matematika` and `/repetitor/informatika` until
  there are real, subject-specific tutor facts (experience, format, results,
  schedule, price) that differ from `/podgotovka`.
- A second commercial page is justified only if it answers a different intent
  (for example, a group course vs. individual lessons), not because the query has
  a synonym.
- Add reviews only after real, verifiable reviews exist; do not invent them.

### Demos, variants and trainers

`демоверсия`, `вариант`, `пробник` queries are high-demand but heavily contested.
They also require a real variant/trainer, not an article. Defer until the product
has a working trainer with answer checking and a clear source policy.

## 4. Content production order for phase 2

1. **Close gaps in the first queue**: if a task-type page has low engagement, add a
   second worked example or a better exercise before adding a new URL.
2. **Add one adjacent number** in a cluster where the first page already gets
   impressions. Example: if OGE math task 15 gets impressions, add task 16/17 with
   unique geometry examples.
3. **Add scoring/reference pages** only when the official scale for the relevant
   year is confirmed.
4. **Add programming/game-theory pages** last: they need the most editorial and
   testing effort.
5. **Re-check cannibalisation** with `cannibalization.csv` and the live URL map
   before every new page.

## 5. Monitoring checklist

Weekly:

- indexed URL count and indexation errors in Webmaster/GSC;
- sitemap status and 404/5xx in server logs;
- impressions, clicks, CTR and average position by cluster;
- organic sessions and landing pages in Metrika;
- exercise attempts and correct/incorrect ratio (article exercises);
- leads and their source page.

Monthly:

- content quality review: which pages get impressions but no clicks; which pages
  get clicks but no engagement;
- update outdated exam structure/scoring pages when official documents change;
- check for new cannibalisation (two URLs ranking for the same query);
- review internal links from high-impression pages to new pages.

Do not evaluate SEO after a few days. A reasonable first review is 8–12 weeks after
indexation, and a strategic review is 6–12 months, depending on the domain's
history and competition.
