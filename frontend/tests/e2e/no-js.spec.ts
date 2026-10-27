import { expect, test } from "@playwright/test";

import { openDerivativeTask } from "./helpers";

test.use({ javaScriptEnabled: false });

test.describe("no-JavaScript fallback", () => {
  test("server-rendered content is visible", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: /Сложное/ }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /Два направления/ })).toBeVisible();

    const state = await page.evaluate(() => {
      const reveal = document.querySelector<HTMLElement>("[data-r]");
      return {
        hasJsClass: document.documentElement.classList.contains("js"),
        revealOpacity: reveal ? getComputedStyle(reveal).opacity : null,
      };
    });

    expect(state.hasJsClass).toBe(false);
    expect(state.revealOpacity).toBe("1");
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

  test("the request form is available", async ({ page }) => {
    await page.goto("/podgotovka");

    await expect(page.locator("[data-lead-form]").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: /Занятия/ }),
    ).toBeVisible();
  });
});
