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
    expect(html).not.toContain('"correct"');

    await page.goto("/matematika/oge/zadanie-6");
    await page.locator('input[type="radio"][value="b"]').check();
    await page.getByRole("button", { name: "Проверить" }).first().click();
    await expect(page.getByText("Верно.").first()).toBeVisible();
    await expect(page.getByText("3/7 ≈ 0,4286")).toBeVisible();
  });
});
