import { expect, test } from "@playwright/test";

import { openDerivativeTask } from "./helpers";

test.describe("conversion CTAs", () => {
  test("task page reveals a CTA after two wrong answers", async ({ page }) => {
    await openDerivativeTask(page);

    const answer = page.getByLabel("Ваш ответ");
    await answer.fill("12");
    await page.getByRole("button", { name: "Проверить" }).click();
    await page.getByRole("button", { name: "Проверить" }).click();

    await expect(page.getByText("Ошибка — это точка роста")).toBeVisible();
  });

  test("task page reveals a CTA after the solution is shown", async ({ page }) => {
    await openDerivativeTask(page);

    await page.getByRole("button", { name: /Показать решение/ }).click();

    await expect(
      page.getByText("Решение видно. А причина ошибки — нет"),
    ).toBeVisible();
  });

  test("CTA click leads to the request form", async ({ page }) => {
    await openDerivativeTask(page);
    await page.getByRole("button", { name: /Показать решение/ }).click();

    await page
      .locator('[data-cta-placement="after-solution"] a[href="/podgotovka#request"]')
      .click();

    await expect(page).toHaveURL(/\/podgotovka#request$/);
  });

  test("article shows mid and end CTAs", async ({ page }) => {
    await page.goto("/articles/proizvodnaya-smysl-grafik-kasatelnaya");

    await expect(page.getByText("Разобрать именно ваши ошибки?")).toBeVisible();
    await expect(
      page.getByText("Дочитать — не то же самое, что научиться"),
    ).toBeVisible();
  });

  test("home quiz shows a CTA after a correct answer", async ({ page }) => {
    await page.goto("/");

    const options = page.getByRole("group", { name: "Варианты ответа" });
    await options.getByRole("button", { name: "3", exact: true }).click();

    await expect(
      page.getByText("На экзамене важна не только правильность"),
    ).toBeVisible();
  });

  test("header offers a trial lesson", async ({ page }) => {
    await page.goto("/");

    await expect(
      page
        .getByRole("banner")
        .locator('a[href="/podgotovka#request"]:visible')
        .first(),
    ).toBeVisible();
  });

  test("no service placeholders are shown in production", async ({ page }) => {
    await openDerivativeTask(page);

    await expect(page.locator("[data-demo-notice]")).toHaveCount(0);
    await expect(page.getByText("Приём заявок пока не настроен")).toHaveCount(0);
  });
});
