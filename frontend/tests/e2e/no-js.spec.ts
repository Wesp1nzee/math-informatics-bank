import { expect, test } from "@playwright/test";

import { openDerivativeTask } from "./helpers";

test.use({ javaScriptEnabled: false });

test.describe("no-JavaScript fallback", () => {
  test("server-rendered content is visible", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: /Математика/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Хотите системный результат/ }),
    ).toBeVisible();

    const state = await page.evaluate(() => {
      const reveal = document.querySelector(".reveal");
      const quizOptions = document.querySelector(
        '[role="group"][aria-label="Варианты ответа"]',
      );
      return {
        hasJsClass: document.documentElement.classList.contains("js"),
        revealOpacity: reveal ? getComputedStyle(reveal).opacity : null,
        quizOptionsDisplay: quizOptions ? getComputedStyle(quizOptions).display : null,
      };
    });

    expect(state.hasJsClass).toBe(false);
    expect(state.revealOpacity).toBe("1");
    expect(state.quizOptionsDisplay).toBe("none");
  });

  test("the solution is readable", async ({ page }) => {
    await openDerivativeTask(page);

    await expect(page.getByRole("heading", { name: "Решение" })).toBeVisible();

    const display = await page.evaluate(() => {
      const panel = document.querySelector("[data-solution]");
      return panel ? getComputedStyle(panel).display : null;
    });
    expect(display).toBe("block");
  });

  test("the Python listing is available", async ({ page }) => {
    await page.goto("/");

    const listing = page.locator("[data-static-code]");
    await expect(listing).toBeVisible();
    await expect(listing).toContainText("while r(n)");
    await expect(listing).toContainText("print(r(n))");
  });
});
