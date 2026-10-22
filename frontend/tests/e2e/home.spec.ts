import { expect, test } from "@playwright/test";

const SECTION_HEADINGS = [
  "Попробуйте сами",
  "Как проходят занятия",
  "Банк задач",
  "Разборы",
  "Вопросы и ответы",
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

  test("renders formulas in the initial HTML without KaTeX on the landing page", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(".formula-plain").first()).toBeVisible();
    await expect(page.locator(".katex")).toHaveCount(0);
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
    ).toHaveAttribute("href", "/zadachi");
  });

  test("every revealed section becomes visible after scrolling", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });

    await expect
      .poll(async () => {
        await page.evaluate(() =>
          window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
        );
        return page.evaluate(() => {
          const all = Array.from(document.querySelectorAll(".reveal"));
          return all.length > 0 && all.every((el) => el.hasAttribute("data-reveal-in"));
        });
      })
      .toBe(true);
  });

  test("reveal still works after client-side navigation", async ({ page }) => {
    await page.goto("/articles");
    await page.getByRole("link", { name: "Главная" }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await page.waitForLoadState("networkidle");
    await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });

    await expect
      .poll(async () => {
        await page.evaluate(() =>
          window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
        );
        return page.evaluate(() => {
          const all = Array.from(document.querySelectorAll(".reveal"));
          return all.length > 0 && all.every((el) => el.hasAttribute("data-reveal-in"));
        });
      })
      .toBe(true);
  });

  test("code walkthrough auto-plays when scrolled into view", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("tab", { name: "Информатика" }).click();
    await page
      .locator('[role="tabpanel"][data-active="true"]')
      .scrollIntoViewIfNeeded();

    await expect
      .poll(() => page.locator(".js-only .code .ln").first().textContent())
      .toContain("def r(n):");
  });
});
