# SEO content plan: first 30 URLs

Status: first queue prepared and published in the local application database on 2026-10-20.
The production domain still needs a deploy and `python -m scripts.seed` (see
`docs/seo/publication-report.md`).

## 1. Data sources

The plan is based on the existing research in `/home/aleksey/wordstat/seo_research`:

| File | What was used |
| --- | --- |
| `reports/seo_business_plan.md` | MVP priorities, commercial logic, explicit warning that model traffic is not achieved traffic. |
| `reports/final_report.md` | Cluster demand, competition and opportunity scores. |
| `reports/clusters.csv` | Cluster IDs, head queries and exact frequencies. |
| `data/results/mvp_pages.csv` | The 30-page first queue and its primary queries. |
| `data/results/page_map.csv` | Query-to-URL mapping, parent pages, intent and `new_page_required`. |
| `data/results/cannibalization.csv` | SERP overlaps and merge recommendations. |
| `data/results/phase2_pages.csv`, `phase3_pages.csv` | Deferred queue; not published in this iteration. |
| `data/results/commercial_keywords.csv`, `commercial_demand.json` | Commercial intent buckets A/B/C; broad demand, not traffic. |
| `data/results/forecast.json`, `monetization.json` | Model outputs only; not used as facts. |

Legend used below: **FACT** — taken from the research files; **DATA-DERIVED** — a
conclusion from those files; **ASSUMPTION** — a product/editorial decision, not a
traffic promise.

## 2. How the research was reconciled

1. `mvp_pages.csv` and the MVP table in `seo_business_plan.md` agree on 30 rows and
   priorities. They are the starting point.
2. `page_map.csv` maps many queries to one URL (`new_page_required=False`). Queries
   were therefore merged by intent and SERP overlap, not counted as pages.
3. `cannibalization.csv` recommends merging queries with URL overlap ≥ 0.5. The
   most important cases were applied:
   - `огэ математика задания` + `задачи огэ математика` → one task hub;
   - `егэ информатика` + `егэ информатика задания` → exam hub plus task hub, with
     different intents (overview vs. task map), not two copies of the same text;
   - `разбор огэ по информатике` + `разбор заданий огэ информатика` → task hubs
     and task-type pages instead of a separate "разборы" page.
4. The research's `/repetitor/...`, `/blog/...` and Cyrillic URLs do not match the
   current Next.js architecture. They were mapped to the real routes:
   - `/repetitor/*` → `/podgotovka`;
   - `/blog/*` → `/articles/*`;
   - `/matematika/teoriya/*` → `/articles/*`;
   - `/matematika/oge/razbory/`, `/informatika/ege/razbory/` → task hubs and
     task-type pages.
5. `2027` change pages were **deferred**: FIPI published only draft 2027 documents
   and a change plan at the time of this work. Publishing exact "changes" without a
   confirmed final document would violate the editorial rules.
6. Exact frequencies below are copied from the research. Where the research has no
   direct query, it is explicitly marked "нет прямого запроса в ядре".

### 2.1. Exam-structure sources

The numbers in exam hubs and task maps were checked against the FIPI 2026
specifications (not invented):

- OGE mathematics 2026: <https://doc.fipi.ru/oge/demoversii-specifikacii-kodifikatory/2026/ma_9_2026.zip>
- EGE mathematics 2026 (base and profile): <https://doc.fipi.ru/ege/demoversii-specifikacii-kodifikatory/2026/ma_11_2026.zip>
- OGE informatics 2026: <https://doc.fipi.ru/oge/demoversii-specifikacii-kodifikatory/2026/inf_9_2026.zip>
- EGE informatics 2026: <https://doc.fipi.ru/ege/demoversii-specifikacii-kodifikatory/2026/inf_11_2026.zip>

For 2027, FIPI published draft documents and a change plan at the time of this
work. The pages therefore say "по спецификации 2026 года" and do not present 2027
as final. Update the pages after the final 2027 documents are approved.

## 3. First queue: 30 URLs

`Exact` is Wordstat exact frequency from the research (`mvp_pages.csv` or
`page_map.csv`). It is demand, not traffic.

| ID | URL | Type | Prio | Primary query | Exact | Intent | Cluster | Status |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| 01 | `/podgotovka` | E commercial | 1 | подготовка к ОГЭ и ЕГЭ по математике | 14 614 broad / exact нет | transactional | math-general-tutor + informatics-general-tutor | existing |
| 02 | `/matematika` | A subject hub | 2 | задания по математике | 1247 | informational | math-general-tasks | existing |
| 03 | `/informatika` | A subject hub | 2 | задания по ОГЭ/ЕГЭ по информатике | 938 / 982 | informational | informatics-oge-tasks + informatics-ege-tasks | existing |
| 04 | `/matematika/oge` | A exam hub | 3 | ОГЭ математика | 65413 | mixed | math-oge-general | new |
| 05 | `/matematika/ege` | A exam hub | 5 | ЕГЭ математика | 17212 | mixed | math-ege-general | new |
| 06 | `/informatika/oge` | A exam hub | 22 | ОГЭ информатика | 38492 | mixed | informatics-oge-general | new |
| 07 | `/informatika/ege` | A exam hub | 5 | ЕГЭ информатика | 37835 | mixed | informatics-ege-general | new |
| 08 | `/matematika/oge/zadaniya` | B task hub | 3 | задания ОГЭ математика | 1486 | informational | math-oge-tasks | new |
| 09 | `/matematika/ege/zadaniya` | B task hub | 21 | задания ЕГЭ математика | 418 | informational | math-ege-tasks | new |
| 10 | `/informatika/oge/zadaniya` | B task hub | 16 | задания ОГЭ информатика | 938 | informational | informatics-oge-tasks | new |
| 11 | `/informatika/ege/zadaniya` | B task hub | 25 | ЕГЭ информатика задания | 982 | informational | informatics-ege-tasks | new |
| 12 | `/matematika/oge/zadanie-6` | B task type | 4 | задание 6 ОГЭ математика | 3198 | informational | math-oge-tasks | new |
| 13 | `/matematika/oge/zadanie-11` | B task type | 6 | задание 11 ОГЭ математика | 1460 | informational | math-oge-tasks | new |
| 14 | `/matematika/oge/zadanie-15` | B task type | 7 | задание 15 ОГЭ математика | 1256 | informational | math-oge-tasks | new |
| 15 | `/matematika/oge/zadanie-19` | B task type | 8 | задание 19 ОГЭ математика | 412 | informational | math-oge-tasks | new |
| 16 | `/informatika/oge/zadanie-5` | B task type | 15 | задание 5 ОГЭ информатика | 382 | informational | informatics-oge-tasks | new |
| 17 | `/informatika/ege/zadanie-2` | B task type | 24 | 2 задание ЕГЭ информатика | 2898 | informational | informatics-ege-tasks | new |
| 18 | `/informatika/ege/zadanie-4` | B task type | 24 | ЕГЭ информатика задание 4 | 2351 | informational | informatics-ege-tasks | new |
| 19 | `/informatika/ege/zadanie-5` | B task type | 24 | задание 5 ЕГЭ информатика | 1669 | informational | informatics-ege-tasks | new |
| 20 | `/informatika/ege/zadanie-8` | B task type | 24 | 8 задание ЕГЭ информатика | 1382 | informational | informatics-ege-tasks | new |
| 21 | `/articles/formuly-sokrashchennogo-umenozheniya` | D article | 12 | формулы сокращённого умножения по алгебре | 2471 | informational | math-general-theory | new |
| 22 | `/articles/stepeni-i-korni-svojstva` | D article | 12 | нет прямого запроса | — | informational | math-general-theory (supporting) | new |
| 23 | `/articles/logicheskie-operacii-tablicy-istinnosti` | D article | 13 | нет прямого запроса | — | informational | informatics-ege-theory (supporting) | new |
| 24 | `/articles/bally-oge-matematika-perevod-v-ocenku` | D article | 19 | баллы ОГЭ математика | 4523 | mixed | math-oge-scoring | new |
| 25 | `/articles/struktura-ege-informatika` | D article | 18 | баллы ЕГЭ информатика | 1472 | mixed | informatics-ege-scoring | new |
| 26 | `/articles/proizvodnaya-smysl-grafik-kasatelnaya` | D article | 20 | производная (нет прямого запроса) | — | informational | math-ege-solutions (supporting) | existing |
| 27 | `/articles/logarifmy-opredelenie-svojstva-oshibki` | D article | 20 | логарифмы (нет прямого запроса) | — | informational | math-ege-solutions (supporting) | existing |
| 28 | `/articles/sistemy-schisleniya-perevod-i-lovushki` | D article | 20 | системы счисления (нет прямого запроса) | — | informational | informatics-ege-solutions (supporting) | existing |
| 29 | `/zadachi/1` | C task | 20 | производная в точке (нет прямого запроса) | — | informational | math-ege-tasks (supporting) | existing |
| 30 | `/zadachi/9` | C task | 20 | перевод в двоичную систему (нет прямого запроса) | — | informational | informatics-ege-tasks (supporting) | existing |

### Why only 9 new task-type pages?

The MVP and page map contain more task numbers (OGE math 10, 20; EGE informatics
6, 7, 10–18, etc.). They are not published in this iteration because:

- the content would be written for the sake of a number, not because the product
  can support it with a worked example and an interactive check;
- several numbers overlap by intent with a hub or an article (see
  `cannibalization.csv`);
- the first queue already covers four different OGE math types (computations,
  graphs, geometry, statements) and four EGE informatics types (logic, coding,
  algorithms, information theory), enough to test the template and demand.

The remaining numbers stay in the phase 2 map (`docs/seo/next-steps.md`).

## 4. Page cards

### 01. `/podgotovka` — commercial page

- **Title:** `Репетиторство: индивидуальные занятия по математике и информатике`
- **H1:** `Хотите системный результат?`
- **Description:** `Индивидуальные занятия по математике и информатике для подготовки к ОГЭ и ЕГЭ. Находим пробелы по темам и выстраиваем работу вокруг них.`
- **Intent:** transactional, one tutor, two subjects.
- **User value:** format, diagnostic first step, tutor profile when configured,
  lead form, FAQ.
- **Unique elements:** real tutor identity from environment variables; no invented
  reviews, prices, results or graduate counts.
- **Interactivity:** lead form with validation and server-side rate limiting.
- **Links:** header/footer, all educational pages through the CTA component;
  parent `/`.
- **Cannibalization:** `/repetitor/matematika/` and `/repetitor/informatika/` from
  the research were **consolidated** here. Two separate pages with the same offer
  and no subject-specific tutor facts would be doorway pages. Both query groups are
  served by one page; the subject sections are natural, not separate URLs.
- **Readiness:** metadata, SSR, form, no fake facts; requires real tutor env values
  before production.

### 02. `/matematika` — subject hub

- **Title:** `Математика: задачи ОГЭ и ЕГЭ с решениями`
- **H1:** `Математика: задачи с пошаговыми разборами`
- **Description:** `Банк задач по математике с ответами и пошаговыми разборами: дроби, уравнения, производная, задачи с параметром. Подготовка к ОГЭ и ЕГЭ.`
- **Intent:** informational hub.
- **User value:** what the subject covers, live task cards, articles, links to OGE
  and EGE hubs.
- **Unique elements:** live API content, exam navigation, subject-specific task
  bank link.
- **Interactivity:** none beyond navigation; not needed for a hub.
- **Links:** parent `/`; children `/matematika/oge`, `/matematika/ege`,
  `/zadachi?subject=matematika`, articles, tasks.
- **Cannibalization:** does not target "задание N" queries; those live on task-type
  pages.
- **Readiness:** SSR, canonical, unique metadata, live content.

### 03. `/informatika` — subject hub

Same pattern as `/matematika`, with informatics content and links to
`/informatika/oge`, `/informatika/ege`, `/zadachi?subject=informatika`,
`/articles/sistemy-schisleniya-perevod-i-lovushki`.

### 04. `/matematika/oge` — OGE math exam hub

- **Title:** `ОГЭ по математике: структура, темы и подготовка`
- **H1:** `ОГЭ по математике: структура и подготовка`
- **Description:** `Сколько заданий в ОГЭ по математике, как устроены части и сколько баллов можно получить. Темы заданий, план подготовки и разборы с проверкой.`
- **Intent:** mixed informational/navigational.
- **User value:** official 2026 structure (25 tasks, 31 primary, 235 minutes),
  topic map, scoring, preparation sequence, links to task types.
- **Unique elements:** fact grid, sectioned explanation, full 25-number map, links
  to the 4 implemented task-type pages.
- **Interactivity:** none; links to interactive task-type pages.
- **Links:** parent `/matematika`; child `/matematika/oge/zadaniya`,
  `/matematika/oge/zadanie-6`, `-11`, `-15`, `-19`; articles
  `bally-oge-matematika-perevod-v-ocenku`, `stepeni-i-korni-svojstva`,
  `formuly-sokrashchennogo-umenozheniya`; `/zadachi?subject=matematika`;
  `/podgotovka`.
- **Cannibalization:** broad head "ОГЭ математика" (exact 65413) is high
  competition. The page is an overview, not a copy of task-type content.
- **Readiness:** official numbers verified against the FIPI 2026 specification;
  no 2027 claims; canonical and breadcrumbs.

### 05. `/matematika/ege` — EGE math exam hub

- **Title:** `ЕГЭ по математике: база и профиль, структура и подготовка`
- **H1:** `ЕГЭ по математике: база и профиль`
- **Description:** `Чем отличаются база и профиль ЕГЭ по математике, сколько заданий и баллов, какие темы проверяют. План подготовки и разборы задач с решениями.`
- **Intent:** mixed.
- **User value:** base vs profile comparison (21 tasks/21 primary/180 min vs 19
  tasks/32 primary/235 min), topic map, strategy, links to existing articles and
  tasks.
- **Unique elements:** comparison table in facts, profile task map, explicit
  warning against choosing profile without a admissions reason.
- **Interactivity:** none; links to interactive articles/tasks.
- **Links:** parent `/matematika`; child `/matematika/ege/zadaniya`; articles
  derivative, logarithms, powers, formulas; tasks 1–8; `/zadachi`.
- **Cannibalization:** distinct from `/matematika/oge`; no duplicate text.
- **Readiness:** official 2026 numbers; unique metadata.

### 06. `/informatika/oge` — OGE informatics exam hub

- **Title:** `ОГЭ по информатике: структура, задания и подготовка`
- **H1:** `ОГЭ по информатике: структура и подготовка`
- **Description:** `Сколько заданий в ОГЭ по информатике, какие темы проверяют и как готовиться. Разбор задания 5, алгоритмы, системы счисления и практические задачи.`
- **Intent:** mixed.
- **User value:** official 2026 structure (16 tasks, 21 primary, 150 minutes,
  12 short + 4 detailed), topic map, practical-work advice, links.
- **Unique elements:** full task map with 16 numbers, practice-oriented checklist.
- **Interactivity:** none; links to `/informatika/oge/zadanie-5`.
- **Links:** parent `/informatika`; child task hub, task type 5; articles systems
  and logic; `/zadachi?subject=informatika`.
- **Cannibalization:** no other OGE informatics hub exists.
- **Readiness:** official 2026 specification; no 2027 claims.

### 07. `/informatika/ege` — EGE informatics exam hub

- **Title:** `ЕГЭ по информатике: структура, задания и баллы`
- **H1:** `ЕГЭ по информатике: структура и подготовка`
- **Description:** `Сколько заданий в ЕГЭ по информатике, какие темы проверяют, сколько первичных баллов и минут. Разборы заданий 2, 4, 5 и 8 с проверкой ответов.`
- **Intent:** mixed.
- **User value:** official 2026 structure (27 tasks, 29 primary, 235 minutes),
  full task map, programming/game-theory strategy, links to 4 task-type pages.
- **Unique elements:** full 27-number map, explicit note about the 2027 draft.
- **Interactivity:** none; links to interactive task-type pages.
- **Links:** parent `/informatika`; child task hub and task types 2, 4, 5, 8;
  articles structure, systems, logic; `/zadachi`.
- **Cannibalization:** broad head "ЕГЭ информатика" (exact 37835) is high
  competition; page is an overview and navigation hub.
- **Readiness:** official 2026 numbers; unique metadata.

### 08. `/matematika/oge/zadaniya` — OGE math task hub

- **Title:** `Задания ОГЭ по математике: типы и разборы`
- **H1:** `Задания ОГЭ по математике: карта и разборы`
- **Description:** `Карта заданий ОГЭ по математике: вычисления, уравнения, геометрия и вероятность. Что проверяет каждый номер, с чего начать и где есть разборы с тренировкой.`
- **Intent:** informational, closer to "which task types exist".
- **User value:** 25-number map, start order, links to implemented types,
  catalogue.
- **Unique elements:** "how to use the map" sequence, task table with notes.
- **Interactivity:** none; links to task-type exercises.
- **Links:** parent `/matematika/oge`; children `/matematika/oge/zadanie-6`,
  `-11`, `-15`, `-19`; `/zadachi`.
- **Cannibalization:** merged with "задачи ОГЭ математика" per
  `cannibalization.csv` (overlap 0.75 and 0.538).
- **Readiness:** unique description, no duplicate of exam hub.

### 09. `/matematika/ege/zadaniya` — EGE math task hub

- **Title:** `Задания ЕГЭ по математике: типы и разборы`
- **H1:** `Задания ЕГЭ по математике: карта и разборы`
- **Description:** `Карта заданий ЕГЭ по математике: база и профиль, планиметрия, производная, вероятность и задачи части 2. Что проверяет каждый номер и с чего начать.`
- **Intent:** informational.
- **User value:** 19-number profile map, base/profile distinction, links to
  articles and tasks.
- **Unique elements:** profile task map and links to derivative/logarithm
  materials.
- **Interactivity:** none; links to interactive exercises in articles.
- **Links:** parent `/matematika/ege`; articles derivative, logarithms, powers;
  `/zadachi`.
- **Cannibalization:** merged with "задания ЕГЭ математика профиль" per research.
- **Readiness:** unique description, SSR.

### 10. `/informatika/oge/zadaniya` — OGE informatics task hub

- **Title:** `Задания ОГЭ по информатике: типы и разборы`
- **H1:** `Задания ОГЭ по информатике: карта и разборы`
- **Description:** `Карта заданий ОГЭ по информатике: информация, логика, алгоритмы, файлы и практические задания. Что проверяет каждый номер и где есть разборы с тренировкой.`
- **Intent:** informational.
- **User value:** 16-number map, practical-work checklist, link to task type 5.
- **Unique elements:** distinction between short-answer and computer tasks.
- **Interactivity:** links to exercise on task type 5.
- **Links:** parent `/informatika/oge`; child `/informatika/oge/zadanie-5`;
  articles systems/logic; `/zadachi`.
- **Cannibalization:** merged with "разбор ОГЭ по информатике" per research.
- **Readiness:** unique description, SSR.

### 11. `/informatika/ege/zadaniya` — EGE informatics task hub

- **Title:** `Задания ЕГЭ по информатике: типы и разборы`
- **H1:** `Задания ЕГЭ по информатике: карта и разборы`
- **Description:** `Карта заданий ЕГЭ по информатике: логика, кодирование, алгоритмы, теория игр и программирование. Что проверяет каждый номер и с чего начать подготовку.`
- **Intent:** informational.
- **User value:** 27-number map, three-block preparation order, links to 4 task
  types.
- **Unique elements:** grouping into basic/algorithms/hard blocks.
- **Interactivity:** links to task-type exercises.
- **Links:** parent `/informatika/ege`; children `/informatika/ege/zadanie-2`,
  `-4`, `-5`, `-8`; article structure; `/zadachi`.
- **Cannibalization:** merged with "разбор ЕГЭ по информатике" per research.
- **Readiness:** unique description, SSR.

### 12. `/matematika/oge/zadanie-6` — computations

- **Title:** `Задание 6 ОГЭ по математике: вычисления с числами`
- **H1:** same.
- **Description:** `Разбор задания 6 ОГЭ: порядок действий, дроби, степени и корни, сравнение чисел на координатной прямой. Примеры, типичные ошибки и тренировка с проверкой.`
- **Intent:** informational, specific task.
- **User value:** what the task checks, order of operations, two worked examples,
  number-line comparison, common mistakes, two server-checked exercises.
- **Unique elements:** official 2026 task role, fraction/decimal strategy,
  independent arithmetic check.
- **Interactivity:** `single_choice` (number between fractions), `numeric_input`
  `(0,6 − 1/4) · 20`, hint.
- **Links:** parent `/matematika/oge/zadaniya`; `/matematika/oge`; articles powers
  and formulas; `/zadachi`; `/podgotovka`.
- **Cannibalization:** no other page targets this exact query; article on powers
  is theory, not a task-number page.
- **Readiness:** content validated, arithmetic checked, answers server-side.

### 13. `/matematika/oge/zadanie-11` — function graphs

- **Title:** `Задание 11 ОГЭ по математике: графики функций`
- **H1:** same.
- **Description:** `Как читать графики линейной, квадратичной и обратной пропорциональности, сопоставлять формулы и графики. Разбор задания 11 ОГЭ с примерами и тренировкой.`
- **Intent:** informational.
- **User value:** three function families, linear graph with parameters,
  properties, worked examples, point check, common mistakes, two exercises.
- **Unique elements:** interactive graph `y = kx + b` with parameters `k` and `b`,
  viewport and trace; direct connection between formula and graph.
- **Interactivity:** `interactive_graph`, `single_choice`, `numeric_input`, hint.
- **Links:** parent hub; `/matematika/oge`; derivative article; `/zadachi`.
- **Cannibalization:** derivative article targets EGE and function meaning, not
  OGE task 11; canonical and intent differ.
- **Readiness:** graph expressions validated by schema; parameters checked; no
  arbitrary code.

### 14. `/matematika/oge/zadanie-15` — geometry

- **Title:** `Задание 15 ОГЭ по математике: площади и треугольники`
- **H1:** same.
- **Description:** `Формулы площади треугольника, параллелограмма и трапеции, теорема Пифагора и тригонометрия. Разбор задания 15 ОГЭ с пошаговыми примерами.`
- **Intent:** informational.
- **User value:** key formulas, right-triangle example, trapezoid example,
  Pythagorean exercise, common mistakes.
- **Unique elements:** formula block with area and trigonometry; explicit
  hypotenuse check; unit advice.
- **Interactivity:** `single_choice` (triangle area), `numeric_input`
  (hypotenuse 9/12), hint.
- **Links:** parent hub; `/matematika/oge/zadanie-19`; `/matematika/oge`;
  powers article; `/zadachi`.
- **Cannibalization:** task type 19 is statements, not calculations; no overlap.
- **Readiness:** formulas and answers checked; schema validation.

### 15. `/matematika/oge/zadanie-19` — geometric statements

- **Title:** `Задание 19 ОГЭ по математике: геометрические утверждения`
- **H1:** same.
- **Description:** `Как проверять истинность геометрических утверждений: параллелограмм, ромб, прямоугольник, квадрат, окружность. Разбор задания 19 ОГЭ и тренировка.`
- **Intent:** informational.
- **User value:** property reference, true/false examples, counterexample method,
  angle-sum exercise, common mistakes.
- **Unique elements:** direct/converse confusion explained with square/rhombus;
  counterexample method.
- **Interactivity:** `single_choice` (only one true statement), `numeric_input`
  (sum of angles of an octagon), hint.
- **Links:** parent hub; `/matematika/oge/zadanie-15`; `/matematika/oge`;
  formulas article; `/zadachi`.
- **Cannibalization:** no other statements page.
- **Readiness:** each statement checked; answer server-side.

### 16. `/informatika/oge/zadanie-5` — executor algorithm

- **Title:** `Задание 5 ОГЭ по информатике: алгоритм для исполнителя`
- **H1:** same.
- **Description:** `Как выполнять и составлять простые алгоритмы для формального исполнителя, решать обратные задачи. Разбор задания 5 ОГЭ по информатике с тренировкой.`
- **Intent:** informational.
- **User value:** executor model, left-to-right execution, direct and reverse
  problems, common mistakes, two exercises.
- **Unique elements:** two command systems, equation for reverse problem.
- **Interactivity:** `single_choice` (reverse), `numeric_input` (forward), hint.
- **Links:** parent hub; `/informatika/oge`; systems article; `/zadachi`.
- **Cannibalization:** EGE task 5 is a different exam and harder format; intents
  are separate per SERP data.
- **Readiness:** arithmetic checked; schema validated.

### 17. `/informatika/ege/zadanie-2` — logic

- **Title:** `Задание 2 ЕГЭ по информатике: таблицы истинности`
- **H1:** same.
- **Description:** `Логические операции, приоритет, таблицы истинности и законы де Моргана. Разбор задания 2 ЕГЭ по информатике с примерами и тренировкой.`
- **Intent:** informational.
- **User value:** five operations, precedence, XOR table, De Morgan, common
  mistakes, two exercises.
- **Unique elements:** explicit implication rule, row-count formula, link to the
  logic article.
- **Interactivity:** `single_choice` (negated OR), `numeric_input` (2^4 rows), hint.
- **Links:** parent hub; `/informatika/ege`; logic article; `/zadachi`.
- **Cannibalization:** logic article is theory across tasks; this page targets the
  exact task number and includes task-specific practice.
- **Readiness:** truth values checked; schema validated.

### 18. `/informatika/ege/zadanie-4` — Fano condition

- **Title:** `Задание 4 ЕГЭ по информатике: условие Фано`
- **H1:** same.
- **Description:** `Префиксные коды, условие Фано, декодирование сообщений и подбор кода минимальной длины. Разбор задания 4 ЕГЭ по информатике.`
- **Intent:** informational.
- **User value:** prefix-code rule, decoding example, minimal-length example,
  common mistakes, two exercises.
- **Unique elements:** explicit Fano check for each candidate code; link to
  systems article.
- **Interactivity:** `single_choice` (decode ACAB), `numeric_input` (min length 3),
  hint.
- **Links:** parent hub; `/informatika/ege/zadanie-5`; systems article; `/zadachi`.
- **Cannibalization:** systems article covers number bases, not coding; EGE task
  14 covers bases; no duplicate.
- **Readiness:** code sets checked; answers server-side.

### 19. `/informatika/ege/zadanie-5` — executor algorithm

- **Title:** `Задание 5 ЕГЭ по информатике: исполнитель и алгоритм`
- **H1:** same.
- **Description:** `Как выполнять программу для исполнителя, восстанавливать исходное число и не путать порядок команд. Разбор задания 5 ЕГЭ по информатике.`
- **Intent:** informational.
- **User value:** forward execution, reverse equation, common mistakes, two
  exercises.
- **Unique elements:** link to OGE task 5 for the simpler format; explicit reverse
  operations.
- **Interactivity:** `single_choice` (reverse), `numeric_input` (forward), hint.
- **Links:** parent hub; `/informatika/oge/zadanie-5`; `/informatika/ege/zadanie-8`;
  `/zadachi`.
- **Cannibalization:** OGE page is simpler and different exam; SERP data shows no
  strong overlap.
- **Readiness:** arithmetic checked.

### 20. `/informatika/ege/zadanie-8` — information measurement

- **Title:** `Задание 8 ЕГЭ по информатике: измерение информации`
- **H1:** same.
- **Description:** `Биты, байты, алфавитный подход, объём текста, изображения и звука. Разбор задания 8 ЕГЭ по информатике с формулами и тренировкой.`
- **Intent:** informational.
- **User value:** N=2^i, I=K·i, text and image examples, bit/byte conversions,
  common mistakes, two exercises.
- **Unique elements:** image and sound parameters, KiB vs KB distinction.
- **Interactivity:** `numeric_input` (message volume), `single_choice` (KiB), hint.
- **Links:** parent hub; logic and coding pages; `/zadachi`.
- **Cannibalization:** EGE tasks 7 and 11 are related but separate numbers; this
  page targets task 8 and includes the shared formula base without claiming to be
  the only page for tasks 7/11.
- **Readiness:** calculations checked; schema validated.

### 21. `/articles/formuly-sokrashchennogo-umenozheniya` — theory

- **Title:** `Формулы сокращённого умножения: таблица, примеры и ошибки`
- **H1:** same.
- **Description:** `Все формулы сокращённого умножения с примерами: квадрат суммы и разности, разность квадратов, кубы. Как применять и не путать знаки.`
- **Intent:** informational.
- **User value:** full formula table, recognition guide, three worked examples,
  sign mistakes, two exercises.
- **Unique elements:** sign rules for cubes, "check the structure" method.
- **Interactivity:** `single_choice` (expand square), `numeric_input` (51²−49²),
  hint.
- **Links:** task type 6 and 19; powers article; `/zadachi`.
- **Cannibalization:** task type 6 uses the formulas but targets a number; this
  article targets the formula query.
- **Readiness:** formulas checked; schema validated.

### 22. `/articles/stepeni-i-korni-svojstva` — theory

- **Title:** `Степени и корни: свойства, формулы и типичные ошибки`
- **H1:** same.
- **Description:** `Свойства степеней с целым показателем и квадратных корней: формулы, примеры, ограничения и ошибки, которые чаще всего встречаются на ОГЭ и ЕГЭ.`
- **Intent:** informational, supporting the task-type pages.
- **User value:** power rules, root rules, three examples, domain restrictions,
  common mistakes, two exercises.
- **Unique elements:** `√(a²)=|a|` explained, negative exponent warning.
- **Interactivity:** `numeric_input` (2^5·2^−3), `single_choice` (√50), hint.
- **Links:** task types 6 and 15; formulas article; `/zadachi`.
- **Cannibalization:** no direct query in the research; marked as supporting, not
  as a demand-backed page.
- **Readiness:** formulas checked; schema validated.

### 23. `/articles/logicheskie-operacii-tablicy-istinnosti` — theory

- **Title:** `Логические операции и таблицы истинности: понятное объяснение`
- **H1:** same.
- **Description:** `Как работают НЕ, И, ИЛИ, импликация и эквивалентность, как строить таблицы истинности и применять законы де Моргана на ЕГЭ по информатике.`
- **Intent:** informational, supporting EGE task 2.
- **User value:** operations, precedence, truth table, De Morgan, common mistakes,
  two exercises.
- **Unique elements:** implication rule and row count explained with examples.
- **Interactivity:** `single_choice` (De Morgan), `numeric_input` (rows for 3
  variables), hint.
- **Links:** EGE task 2; EGE hub; `/zadachi`.
- **Cannibalization:** task 2 page is task-specific; article is a reusable theory
  reference. Both are linked, but titles and intents differ.
- **Readiness:** truth values checked.

### 24. `/articles/bally-oge-matematika-perevod-v-ocenku` — reference

- **Title:** `Баллы ОГЭ по математике: перевод в оценку и минимум`
- **H1:** same.
- **Description:** `Сколько первичных баллов можно получить за ОГЭ по математике, как перевести их в оценку по рекомендациям 2026 года и что нужно для профильного класса.`
- **Intent:** mixed informational.
- **User value:** 2026 scale, geometry condition, profile-class guidance, caveats
  about regional rules.
- **Unique elements:** explicit caveat and source link to FIPI; no claim that the
  2027 scale is final.
- **Interactivity:** `single_choice` (max primary), `numeric_input` (grade 5
  threshold), hint.
- **Links:** OGE hub; task hub; `/zadachi`.
- **Cannibalization:** no other scoring page; OGE hub links here instead of
  duplicating the scale in full.
- **Readiness:** numbers verified against 2026 recommendations; source and caveat
  present.

### 25. `/articles/struktura-ege-informatika` — reference

- **Title:** `Структура ЕГЭ по информатике 2026: задания, баллы и время`
- **H1:** same.
- **Description:** `Сколько заданий в ЕГЭ по информатике, сколько первичных баллов и минут, какие темы проверяет каждое задание. Официальная структура 2026 года.`
- **Intent:** mixed informational.
- **User value:** 27 tasks, 29 primary, 235 minutes, full task map, preparation
  blocks, common mistakes.
- **Unique elements:** task-by-task map, explicit 2027 draft note.
- **Interactivity:** `single_choice` (duration), `numeric_input` (max primary),
  hint.
- **Links:** EGE hub; task types 2, 4, 5, 8; `/zadachi`.
- **Cannibalization:** EGE hub is an overview; this article is the detailed
  reference. They target different query groups (hub vs. structure/scoring).
- **Readiness:** official 2026 numbers; no 2027 claims.

### 26. `/articles/proizvodnaya-smysl-grafik-kasatelnaya` — existing article

- **Title:** `Производная: смысл, график и касательная`
- **Description:** `Почему производная — это наклон касательной, как читать её знак и нули и как решать задачи ЕГЭ на касательную без зубрёжки.`
- **Intent:** informational EGE math theory.
- **User value:** derivative as a rate and as a tangent slope, sign/zeros, graph
  with parameters, worked example, mistakes, exercises.
- **Links:** EGE math hub, task hub, task `/zadachi/1`, powers article.
- **Cannibalization:** does not target OGE task 11; it is EGE theory and a
  supporting page for the EGE hub.
- **Readiness:** existing published article; validated by the existing pipeline.

### 27. `/articles/logarifmy-opredelenie-svojstva-oshibki` — existing article

- **Title:** `Логарифмы: определение, свойства и типичные ошибки`
- **Description:** `Логарифм как вопрос «в какую степень возвести основание», свойства, область допустимых значений и разбор экзаменационных задач.`
- **Intent:** informational EGE math theory.
- **User value:** definition, properties, domain, worked examples, mistakes,
  exercises.
- **Links:** EGE math hub, task hub, tasks 5–8, powers article.
- **Cannibalization:** separate topic from powers/roots; cross-linked, not merged.
- **Readiness:** existing published article.

### 28. `/articles/sistemy-schisleniya-perevod-i-lovushki` — existing article

- **Title:** `Системы счисления: перевод, сложение и ловушки ЕГЭ`
- **Description:** `Позиционная запись числа, перевод в двоичную и обратно, сложение в двоичной системе и ошибки, которые стоят баллов.`
- **Intent:** informational informatics theory.
- **User value:** positional notation, conversion both ways, binary addition,
  common mistakes, exercises.
- **Links:** EGE/OGE informatics hubs, task hubs, task `/zadachi/9`, task types
  4/5/8.
- **Cannibalization:** theory page, not a task-number page; task types link here for
  the base concept.
- **Readiness:** existing published article.

### 29. `/zadachi/1` — existing task page

- **Title:** `Производная в точке — задача #1`
- **H1:** `Производная в точке`
- **Description:** `Найдите значение производной многочлена в заданной точке. Математика, ЕГЭ · Профиль. Ответ и решение по шагам.`
- **Intent:** informational task query.
- **User value:** statement, server-checked answer (`3`), step-by-step solution,
  related tasks.
- **Links:** EGE math hub/task hub, derivative article, related tasks.
- **Cannibalization:** a concrete task, not a task-type page; linked from the
  derivative article and the EGE hub.
- **Readiness:** existing published task; HTTP 200, answer check works.

### 30. `/zadachi/9` — existing task page

- **Title:** `Перевод в двоичную систему — задача #9`
- **H1:** `Перевод в двоичную систему`
- **Description:** `Переведите число из десятичной системы в двоичную. Информатика, ЕГЭ · Информатика. Ответ и решение по шагам.`
- **Intent:** informational task query.
- **User value:** statement, server-checked answer (`1101`), solution steps,
  related tasks.
- **Links:** EGE informatics hub/task hub, number-systems article, related tasks.
- **Cannibalization:** a concrete task; the number-systems article is theory.
- **Readiness:** existing published task; HTTP 200, answer check works.

## 5. Cannibalization decisions

| Potential conflict | Decision | Reason |
| --- | --- | --- |
| `/repetitor/matematika/` vs `/repetitor/informatika/` | one page `/podgotovka` | Same tutor, same offer, no subject-specific facts; separate URLs would be doorway pages. |
| `/matematika/oge/zadaniya` vs `задачи ОГЭ математика` | one hub | SERP overlap 0.75 and 0.538; merge recommended in `cannibalization.csv`. |
| `/informatika/oge/zadaniya` vs `разбор ОГЭ по информатике` | task hub + task-type pages | Overlap 0.667; a separate "разборы" page would duplicate the hub. |
| `/blog/баллы-огэ-математик/` vs `/matematika/oge` | article + hub | Hub links to the scoring article; the scale is not duplicated in full. |
| `/matematika/teoriya/...` vs `/articles/...` | `/articles/...` | The app has one article system; a second `/blog` or `/teoriya` route would fragment content and canonical signals. |
| EGE task 2 vs logic article | both, different intent | Task page: "how to solve task 2"; article: "what logic operations are". Cross-linked. |
| EGE task 8 vs tasks 7/11 | one page for task 8 | The research has separate numbers; this page does not claim to replace 7/11. Phase 2 can add them if content is ready. |

## 6. Publication readiness checklist (per page)

A page is ready when all of the following are true:

1. The intent matches the query; the page is not a synonym duplicate.
2. Title, description and H1 are unique and descriptive.
3. Canonical points to the page itself; no noindex on a public page.
4. The page is present in `sitemap.xml` and linked from at least one indexable page.
5. The main content is present in the server HTML (no client-only body).
6. HTTP status is 200; unknown URLs return 404.
7. Math/code examples are checked independently; numeric answers are recomputed.
8. Interactive blocks pass `ArticleContent v2` validation.
9. Exercise answers are not present in public content for article exercises.
10. Internal links point to existing URLs (crawler check).
11. Mobile viewport has no horizontal overflow; keyboard focus works.
12. The page builds and passes the frontend tests.
