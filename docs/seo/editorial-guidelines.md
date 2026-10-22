# Editorial guidelines: educational SEO content

These rules apply to articles, task-type pages, exam hubs and task pages. They are
written for the actual codebase (`ArticleContent v2`, `ArticleRenderer`,
`backend/scripts/seed_content.py`), not for a generic CMS.

## 1. Audience and tone

- Write for a Russian-speaking student in grades 8–11 who is preparing for OGE or
  EGE, not for a search engine.
- Explain the idea first, then the algorithm, then the example. Do not start with
  a wall of definitions.
- Use "вы" consistently. Avoid bureaucratic phrases and motivational clichés.
- Do not promise a score, admission, or "guaranteed result".
- A page must answer one concrete user job: understand a type of task, check an
  answer, see a step-by-step solution, compare exam formats, or practise.

## 2. Structure

Choose the structure for the topic; do not mechanically insert every block.

Typical educational article:

1. A short statement of what the reader will learn.
2. The minimum theory needed for the task.
3. Notation and definitions.
4. The solution principle or algorithm.
5. One fully worked example.
6. A practice task with server-side checking.
7. Common mistakes.
8. A short summary.
9. Links to related materials.

Reference pages may be shorter and use tables/lists. A task-type page should
include the task's role in the exam, an algorithm, a worked example, mistakes and
at least one checked exercise. A task page must contain the statement, the answer,
a step-by-step solution and related tasks.

## 3. Math

- Every formula must be correct for the stated domain. Write restrictions
  explicitly (for example, `a ≥ 0`, `b > 0`, `a ≠ 0`).
- Check every numeric answer independently: recompute it, substitute it back, or
  use a second method. Do not trust the explanation text alone.
- Use `,` as the decimal separator in Russian text and `{,}` in TeX where needed.
- Do not write `√(a²) = a` without the absolute value; the correct statement is
  `√(a²) = |a|`.
- For geometry, state which side is the hypotenuse, which height is used, and
  whether the answer is a length, area or angle.
- If a problem is an author's training problem, say so. Do not attribute it to
  FIPI, an official variant, or a real exam unless the source is confirmed.
- Do not publish a problem with an ambiguous wording unless the ambiguity is the
  point of the exercise and is explained.

## 4. Code

- Python examples must be executable as written. Run them before publication.
- Do not use external libraries unless the task requires them and the environment
  is documented.
- Show input/output for at least one example.
- Do not claim that a program is "the official solution"; it is a training
  implementation.
- For algorithm tasks, check edge cases: empty input, one element, negative
  numbers, large values, duplicate values.

## 5. Sources and facts

- Use official sources for exam structure, dates, scores and changes: FIPI,
  Rosobrnadzor, the regional education authority.
- Put the source year in the text: "по спецификации 2026 года", not "по
  официальной спецификации" without a year.
- If only a draft exists (for example, 2027 documents), say "проект" and do not
  present it as final.
- Do not invent statistics, research, expert quotes, reviews, graduate counts,
  scores or prices.
- Do not use a model forecast from the SEO research as achieved traffic. If a
  number is a model output, label it as such.
- Do not copy a task from a textbook or another site without permission. Author
  your own wording and examples.

## 6. Interactivity

Use the existing `ArticleContent v2` blocks and renderer. Do not build a parallel
quiz or answer checker.

| Block | When to use |
| --- | --- |
| `rich_text` (paragraph) | Explanation. |
| `rich_text` (heading, level 2/3) | Section structure; never H1 inside an article. |
| `rich_text` (list) | Conditions, steps, mistakes. |
| `math` | A displayed formula with a caption. |
| `interactive_graph` | Only when changing a parameter teaches a property. The expression grammar is limited; validate it. |
| `single_choice` | A conceptual check with one correct option. |
| `numeric_input` | A computable answer with a tolerance. |
| `step_solution` | A multi-step worked solution. |
| `hint` | A nudge that does not reveal the answer immediately. |
| `callout` | A definition, warning, or source note. |
| `image` | Only with meaningful alt text and known dimensions. |
| `divider` | Separation of large sections. |

Rules:

1. One or two exercises per page are usually enough. Do not add ten for "SEO
   richness".
2. Every exercise must be checkable by the existing server endpoint. Do not create
   a question with free-form text if the endpoint cannot check it.
3. `single_choice` and `numeric_input` answers stay in the database; the public API
   strips `correct_option_id`, `correct_value` and `explanation`. Do not copy them
   into client components, `data-*` attributes or a separate JSON file.
4. The `explanation` is returned only after a correct answer for article
   exercises. Do not show it before checking.
5. Graph expressions must use the allowed grammar: `x`, numbers, `+ - * / ^`,
   parentheses, `sin cos tan asin acos atan exp ln log2 log10 sqrt abs`, `pi`, `e`
   and declared parameters. Do not try to execute arbitrary code.
6. Check the graph on desktop and mobile; `interactive-graph.tsx` is lazy-loaded
   and must not be imported into unrelated pages.
7. Keep keyboard access: labels for inputs, `aria-label` for graph sliders,
   focus-visible styles, no mouse-only interaction.
8. Respect `prefers-reduced-motion`; do not add decorative motion that blocks
   reading.
9. Do not create fake progress for anonymous users. Progress is saved only when
   the API returns an authenticated user context.

### Important distinction: task bank vs. article exercises

- **Article exercises** (`single_choice`, `numeric_input` inside `ArticleContent`)
  are server-checked and their answer keys are removed from public content.
- **Task bank pages** (`/zadachi/{id}`) intentionally publish the answer and the
  full solution as the educational product, similar to a solution bank. The page
  also supports server-side answer checking. Do not add a new "hidden answer"
  mechanism that conflicts with this model, and do not expose answer keys for
  article exercises.

## 7. Metadata and links

- Title: unique, 45–70 characters, describes the page, not a keyword dump.
- Description: unique, 120–170 characters, explains the benefit.
- H1: one per page; may differ slightly from the title.
- Canonical: the page's own absolute URL. Do not canonicalise a page to a
  different page to "fix" a URL structure problem.
- Open Graph: title, description, URL, type. Images are optional; do not add a
  fake image.
- Internal links: link only to pages that exist. Use descriptive anchor text.
  Every new page must be reachable from the subject hub or an exam/task hub.
- Breadcrumbs: visible and mirrored in `BreadcrumbList` JSON-LD.
- Do not add `FAQPage`, `Course`, `Product`, `Review` or rating markup unless the
  visible page actually contains that content and the data is real.

## 8. Publication checklist

Before publishing:

1. Validate the content with `ArticleContent.model_validate`.
2. Check block IDs are unique; check links start with `/` or `https://`.
3. Recompute all numeric answers; check all choice options.
4. Run the backend tests (`uv run pytest`).
5. Run the frontend typecheck, lint and unit tests.
6. Build the frontend.
7. Check the page with JavaScript disabled: title, description, canonical, H1,
   body text, formulas and links must be in the HTML.
8. Check HTTP 200, the canonical URL and the sitemap entry.
9. Check mobile width, keyboard focus and the exercise check.
10. Check that article exercise answers are absent from the HTML/JSON.
11. Add the page to the content plan and publication report.
12. Do not publish a draft; `is_published` must be true only after the checks.

## 9. What not to do

- Do not mass-generate pages by changing one number.
- Do not repeat the same text on dozens of URLs.
- Do not create an empty page for every synonym.
- Do not use hidden text or keyword stuffing.
- Do not add irrelevant internal links just to increase link count.
- Do not publish a draft or an article with an empty body.
- Do not invent reviews, prices, results, or official status.
- Do not present a model forecast as a fact.
- Do not claim that a page is indexed; only technical availability can be checked
  locally.
