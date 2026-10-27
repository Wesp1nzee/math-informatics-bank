import { expect, test } from "@playwright/test";

const SEO_PAGES = [
  { path: "/matematika/oge", title: /ОГЭ по математике/ },
  { path: "/matematika/ege", title: /ЕГЭ по математике/ },
  { path: "/informatika/oge", title: /ОГЭ по информатике/ },
  { path: "/informatika/ege", title: /ЕГЭ по информатике/ },
  { path: "/matematika/oge/zadaniya", title: /Задания ОГЭ по математике/ },
  { path: "/matematika/ege/zadaniya", title: /Задания ЕГЭ по математике/ },
  { path: "/informatika/oge/zadaniya", title: /Задания ОГЭ по информатике/ },
  { path: "/informatika/ege/zadaniya", title: /Задания ЕГЭ по информатике/ },
  { path: "/matematika/oge/zadanie-6", title: /Задание 6 ОГЭ/ },
  { path: "/matematika/oge/zadanie-11", title: /Задание 11 ОГЭ/ },
  { path: "/matematika/oge/zadanie-15", title: /Задание 15 ОГЭ/ },
  { path: "/matematika/oge/zadanie-19", title: /Задание 19 ОГЭ/ },
  { path: "/informatika/oge/zadanie-5", title: /Задание 5 ОГЭ/ },
  { path: "/informatika/ege/zadanie-2", title: /Задание 2 ЕГЭ/ },
  { path: "/informatika/ege/zadanie-4", title: /Задание 4 ЕГЭ/ },
  { path: "/informatika/ege/zadanie-5", title: /Задание 5 ЕГЭ/ },
  { path: "/informatika/ege/zadanie-8", title: /Задание 8 ЕГЭ/ },
  { path: "/matematika/oge/zadanie-10", title: /Задание 10 ОГЭ/ },
  { path: "/matematika/oge/zadanie-16", title: /Задание 16 ОГЭ/ },
  { path: "/matematika/oge/zadanie-18", title: /Задание 18 ОГЭ/ },
  { path: "/matematika/oge/zadanie-20", title: /Задание 20 ОГЭ/ },
  { path: "/informatika/oge/zadanie-2", title: /Задание 2 ОГЭ/ },
  { path: "/informatika/oge/zadanie-6", title: /Задание 6 ОГЭ/ },
  { path: "/informatika/oge/zadanie-7", title: /Задание 7 ОГЭ/ },
  { path: "/informatika/oge/zadanie-8", title: /Задание 8 ОГЭ/ },
  { path: "/informatika/oge/zadanie-16", title: /Задание 16 ОГЭ/ },
  { path: "/informatika/ege/zadanie-3", title: /Задание 3 ЕГЭ/ },
  { path: "/informatika/ege/zadanie-6", title: /Задание 6 ЕГЭ/ },
  { path: "/informatika/ege/zadanie-7", title: /Задание 7 ЕГЭ/ },
  { path: "/informatika/ege/zadanie-10", title: /Задание 10 ЕГЭ/ },
  { path: "/informatika/ege/zadanie-11", title: /Задание 11 ЕГЭ/ },
  { path: "/informatika/ege/zadanie-12", title: /Задание 12 ЕГЭ/ },
  { path: "/informatika/ege/zadanie-13", title: /Задание 13 ЕГЭ/ },
  { path: "/informatika/ege/zadanie-14", title: /Задание 14 ЕГЭ/ },
  { path: "/informatika/ege/zadanie-18", title: /Задание 18 ЕГЭ/ },
  { path: "/informatika/ege/zadanie-22", title: /Задание 22 ЕГЭ/ },
  { path: "/matematika/ege/teoriya", title: /Теория ЕГЭ по математике/ },
  { path: "/informatika/ege/teoriya", title: /Теория ЕГЭ по информатике/ },
  { path: "/matematika/oge/razbory", title: /Разборы ОГЭ по математике/ },
  { path: "/matematika/razbory", title: /Разборы задач по математике/ },
  { path: "/informatika/ege/razbory", title: /Разборы ЕГЭ по информатике/ },
  { path: "/informatika/oge/razbory", title: /Разборы ОГЭ по информатике/ },
  { path: "/informatika/10-klass", title: /Информатика 10 класс/ },
  { path: "/repetitor/matematika", title: /Репетитор по математике/ },
  { path: "/repetitor/informatika", title: /Репетитор по информатике/ },
  { path: "/articles/bally-ege-matematika", title: /Баллы ЕГЭ по математике/ },
  { path: "/articles/bally-ege-informatika", title: /Баллы ЕГЭ по информатике/ },
  { path: "/articles/bally-oge-informatika", title: /Баллы ОГЭ по информатике/ },
  {
    path: "/articles/izmeneniya-ege-informatika-2027",
    title: /Изменения ЕГЭ по информатике 2027/,
  },
  {
    path: "/articles/izmeneniya-ege-matematika-2027",
    title: /Изменения ЕГЭ по математике 2027/,
  },
  {
    path: "/articles/izmeneniya-oge-matematika-2027",
    title: /Изменения ОГЭ по математике 2027/,
  },
  {
    path: "/articles/izmeneniya-oge-informatika-2027",
    title: /Изменения ОГЭ по информатике 2027/,
  },
  { path: "/articles/formuly-sokrashchennogo-umenozheniya", title: /Формулы/ },
  { path: "/articles/stepeni-i-korni-svojstva", title: /Степени и корни/ },
  {
    path: "/articles/logicheskie-operacii-tablicy-istinnosti",
    title: /Логические операции/,
  },
  {
    path: "/articles/bally-oge-matematika-perevod-v-ocenku",
    title: /Баллы ОГЭ/,
  },
  { path: "/articles/struktura-ege-informatika", title: /Структура ЕГЭ/ },
];

test.describe("SEO pages", () => {
  for (const { path, title } of SEO_PAGES) {
    test(`${path} is server-rendered with unique metadata`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page).toHaveTitle(title);

      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute("content", /.{40,}/);

      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute(
        "href",
        new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
      );

      await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(
        0,
      );
    });
  }

  test("sitemap lists every SEO page and no internal SEO article aliases", async ({
    request,
  }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();

    for (const { path } of SEO_PAGES) {
      expect(body).toContain(path);
    }
    expect(body).not.toContain("/articles/seo-");
  });

  test("internal SEO article alias redirects to the public path", async ({
    request,
  }) => {
    const response = await request.get("/articles/seo-matematika-oge-zadanie-6", {
      maxRedirects: 0,
    });
    expect([301, 308]).toContain(response.status());
    expect(response.headers()["location"]).toBe("/matematika/oge/zadanie-6");
  });

  test("unknown task types and task ids return 404", async ({ request }) => {
    expect((await request.get("/matematika/oge/zadanie-99")).status()).toBe(404);
    expect((await request.get("/informatika/ege/zadanie-2/extra")).status()).toBe(404);
    expect((await request.get("/zadachi/does-not-exist")).status()).toBe(404);
  });

  test("server-checked exercise does not expose the answer in HTML", async ({
    page,
    request,
  }) => {
    const response = await request.get("/matematika/oge/zadanie-6");
    const html = await response.text();
    expect(html).not.toContain("correct_option_id");
    expect(html).not.toContain("correct_value");
    expect(html).not.toContain("correct_answer");
    expect(html).not.toContain('"correct"');

    await page.goto("/matematika/oge/zadanie-6");
    const numeric = page.locator("#article-numeric-moge6-type1-p1-task");
    await numeric.fill("6,8");
    await page
      .locator("form")
      .filter({ has: numeric })
      .getByRole("button", { name: "Проверить" })
      .click();
    await expect(page.getByText("Верно.").first()).toBeVisible();
    await expect(page.getByText("9,2−2,4 = 6,8").first()).toBeVisible();
  });

  test("matching exercise checks the column order", async ({ page }) => {
    await page.goto("/informatika/ege/zadanie-2");
    const input = page.locator("#article-matching-iege2-type1-p1-matching");
    await input.fill("1324");
    await page
      .locator("form")
      .filter({ has: input })
      .getByRole("button", { name: "Проверить" })
      .click();
    await expect(page.getByText("Верно.").first()).toBeVisible();
    await expect(page.getByText("Столбцы идут в порядке").first()).toBeVisible();
  });

  test("text exercise checks a command sequence", async ({ page }) => {
    await page.goto("/informatika/oge/zadanie-5");
    const input = page.locator("#article-text-ioge5-type2-worked-task");
    await input.fill("12211");
    await page
      .locator("form")
      .filter({ has: input })
      .getByRole("button", { name: "Проверить" })
      .click();
    await expect(page.getByText("Верно.").first()).toBeVisible();
    await expect(
      page.getByText(/Подходит последовательность 12211/).first(),
    ).toBeVisible();
  });

  test("numeric exercise checks a search query", async ({ page }) => {
    await page.goto("/informatika/oge/zadanie-8");
    const input = page.locator("#article-numeric-ioge8-type1-p1-task");
    await input.fill("4540");
    await page
      .locator("form")
      .filter({ has: input })
      .getByRole("button", { name: "Проверить" })
      .click();
    await expect(page.getByText("Верно.").first()).toBeVisible();
    await expect(page.getByText(/Подставляем: .*4540/).first()).toBeVisible();
  });
});
