import { expect, test } from "@playwright/test";

test.describe("navigation and layout", () => {
  test("header links lead to real pages", async ({ page, isMobile }) => {
    await page.goto("/");

    const target = isMobile ? page.getByRole("button", { name: "Открыть меню" }) : null;
    if (target) await target.click();

    await page.getByRole("link", { name: "Задачи", exact: true }).first().click();
    await expect(page).toHaveURL(/\/zadachi$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("tutoring CTA reaches the request page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Обсудить занятия/ }).click();
    await expect(page).toHaveURL(/\/podgotovka(#request)?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /системный результат/ }),
    ).toBeVisible();
  });

  test("catalogue filters and pagination work", async ({ page }) => {
    await page.goto("/zadachi");
    const main = page.locator("#main");

    await main.getByRole("link", { name: "Информатика", exact: true }).click();
    await expect(page).toHaveURL(/subject=informatika/);
    await expect(page.getByText(/4 задачи/)).toBeVisible();
    await expect(
      main.getByRole("link", { name: /Перевод в двоичную систему/ }),
    ).toBeVisible();
    await expect(main.getByRole("link", { name: /Производная/ })).toHaveCount(0);

    await page.goto("/zadachi");
    await main.getByRole("link", { name: "Страница 2" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText(/страница 2 из 3/)).toBeVisible();
  });

  test("no horizontal overflow on the viewport", async ({ page }) => {
    for (const route of ["/", "/zadachi", "/articles"]) {
      await page.goto(route);
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
        )
        .toBe(true);
    }
  });

  test("unknown routes render the 404 page with a real 404 status", async ({
    page,
  }) => {
    const response = await page.goto("/zadachi/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Страница не найдена" }),
    ).toBeVisible();
  });
});
