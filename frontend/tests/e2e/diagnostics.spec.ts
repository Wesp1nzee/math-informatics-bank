import { expect, test } from "@playwright/test";

test.describe("diagnostics", () => {
  test("produces a per-topic report and a request CTA", async ({ page }) => {
    await page.goto("/diagnostika");

    const questions = page.locator("fieldset");
    const count = await questions.count();
    expect(count).toBeGreaterThanOrEqual(8);

    for (let index = 0; index < count; index += 1) {
      await questions.nth(index).getByRole("radio").first().check();
    }

    await page.getByRole("button", { name: "Показать результат" }).click();

    await expect(page.getByRole("heading", { name: /Результат:/ })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Разобрать результат на пробном/ }),
    ).toHaveAttribute("href", "/podgotovka#request");
  });

  test("asks to answer everything before showing the report", async ({ page }) => {
    await page.goto("/diagnostika");

    await page.getByRole("button", { name: "Показать результат" }).click();

    await expect(
      page.getByText("Ответьте на все вопросы, чтобы увидеть результат."),
    ).toBeVisible();
  });
});
