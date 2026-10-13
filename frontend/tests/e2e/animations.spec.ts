import { expect, test } from "@playwright/test";

test.describe("animations", () => {
  test("hero graph is draggable with the keyboard and reveals a CTA", async ({
    page,
  }) => {
    await page.goto("/");

    const slider = page.getByRole("slider", {
      name: "Положение точки на графике",
    });
    await slider.focus();
    await page.keyboard.press("ArrowRight");

    await expect(page.getByText("Так я объясняю каждую тему")).toBeVisible();
  });

  test("code demo can be paused and skipped", async ({ page }) => {
    await page.goto("/");

    await page
      .locator('section[aria-labelledby="code-title"]')
      .scrollIntoViewIfNeeded();

    await page.getByRole("button", { name: "Пауза" }).click();
    await expect(page.getByRole("button", { name: "Продолжить" })).toBeVisible();

    await page.getByRole("button", { name: "Пропустить" }).click();
    await expect(page.getByText(/Вывод:/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Повторить" })).toBeVisible();
  });

  test("reduced motion keeps the hero visible and the graph usable", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: /Математика/ }),
    ).toBeVisible();

    const slider = page.getByRole("slider", {
      name: "Положение точки на графике",
    });
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByText("Так я объясняю каждую тему")).toBeVisible();
  });
});
