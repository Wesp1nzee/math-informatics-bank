import { expect, test } from "@playwright/test";

const SECTION_HEADINGS = [
  "Не смотрите решение",
  "Алгоритм — это тоже способ мышления",
  "Как думать, а не заучивать",
  "Задачи по математике",
  "Хотите системный результат?",
  "Хорошее обучение",
  "Начнём с вашей ошибки",
];

test.describe("home page", () => {
  test("shows the hero and every main section", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: /Математика/ }),
    ).toBeVisible();

    for (const heading of SECTION_HEADINGS) {
      await expect(
        page.getByRole("heading", { name: new RegExp(heading) }).first(),
      ).toBeAttached();
    }

    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("renders KaTeX formulas in the initial HTML", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".katex").first()).toBeVisible();
  });

  test("has no placeholder links and no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(await page.locator('a[href="#"]').count()).toBe(0);
    expect(errors).toEqual([]);
  });

  test("quiz reacts to a correct and a wrong answer", async ({ page }) => {
    await page.goto("/");

    const options = page.getByRole("group", { name: "Варианты ответа" });

    await options.getByRole("button", { name: "0", exact: true }).click();
    await expect(page.getByText("Не совсем.")).toBeVisible();

    await page.getByRole("button", { name: "Попробовать снова" }).click();
    await options.getByRole("button", { name: "3", exact: true }).click();
    await expect(page.getByText("Верно.")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Разобрать подробнее/ }),
    ).toHaveAttribute("href", "/zadachi/1042");
  });

  test("every revealed section becomes visible after scrolling", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect
      .poll(async () =>
        page.evaluate(() => {
          const all = Array.from(document.querySelectorAll(".reveal"));
          return all.length > 0 && all.every((el) => el.hasAttribute("data-reveal-in"));
        }),
      )
      .toBe(true);
  });

  test("reveal still works after client-side navigation", async ({ page }) => {
    await page.goto("/articles");
    await page.getByRole("link", { name: "Главная" }).first().click();
    await expect(page).toHaveURL(/\/$/);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect
      .poll(async () =>
        page.evaluate(() => {
          const all = Array.from(document.querySelectorAll(".reveal"));
          return all.length > 0 && all.every((el) => el.hasAttribute("data-reveal-in"));
        }),
      )
      .toBe(true);
  });

  test("code walkthrough auto-plays when scrolled into view", async ({ page }) => {
    await page.goto("/");

    await page
      .locator('section[aria-labelledby="code-title"]')
      .scrollIntoViewIfNeeded();

    await expect
      .poll(() => page.locator(".js-only .code .ln").first().textContent())
      .toContain("def r(n):");
  });
});
