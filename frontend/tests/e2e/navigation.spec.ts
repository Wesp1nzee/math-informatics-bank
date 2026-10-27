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

  test("tutoring CTA reaches the request page", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) {
      await page.getByRole("button", { name: "Открыть меню" }).click();
      await page.getByRole("dialog").locator('a[href="/podgotovka"]').click();
    } else {
      await page.locator('header a[href="/podgotovka"]:visible').first().click();
    }
    await expect(page).toHaveURL(/\/podgotovka(#request)?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Занятия/ }),
    ).toBeVisible();
  });

  test("catalogue filters and pagination work", async ({ page }) => {
    await page.goto("/zadachi");
    const main = page.locator("#main");

    await main.getByRole("link", { name: "Информатика", exact: true }).click();
    await expect(page).toHaveURL(/subject=informatika/);
    await expect(page.getByText(/\d+ задачи/)).toBeVisible();
    await expect(
      main.getByRole("link", { name: /Системы счисления|Перевод в двоичную систему/ }),
    ).toBeVisible();
    await expect(main.getByRole("link", { name: /Производная/ })).toHaveCount(0);

    await page.goto("/zadachi");
    await main.getByRole("link", { name: "Страница 2" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText(/страница 2 из \d+/)).toBeVisible();
  });

  test("mobile menu opens without shifting the viewport", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "mobile-only navigation check");

    await page.goto("/");
    const before = await page.evaluate(() => document.documentElement.scrollWidth);
    await page.getByRole("button", { name: "Открыть меню" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const after = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(after).toBeLessThanOrEqual(before);

    await page.getByRole("button", { name: "Закрыть меню" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("display math stays inside a scrollable article container at 320px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.goto("/articles/proizvodnaya-smysl-grafik-kasatelnaya");

    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - root.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);

    const scrollable = await page.evaluate(() => {
      const display = document.querySelector(".katex-display");
      const figure = display?.closest("figure");
      if (!figure) return false;
      return getComputedStyle(figure).overflowX === "auto";
    });
    expect(scrollable).toBe(true);
  });

  test("no horizontal overflow on the viewport", async ({ page }) => {
    const routes = [
      "/",
      "/zadachi",
      "/zadachi/1",
      "/articles",
      "/articles/proizvodnaya-smysl-grafik-kasatelnaya",
      "/matematika",
      "/matematika/oge",
      "/matematika/oge/zadaniya",
      "/matematika/oge/zadanie-6",
      "/informatika/ege/zadanie-2",
      "/diagnostika",
      "/podgotovka",
      "/repetitor/matematika",
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect
        .poll(
          () =>
            page.evaluate(
              () =>
                document.documentElement.scrollWidth <=
                document.documentElement.clientWidth + 1,
            ),
          { message: `${route} must not overflow horizontally` },
        )
        .toBe(true);
    }
  });

  test("content containers fill the mobile viewport", async ({ page }) => {
    test.skip(page.viewportSize()!.width >= 768, "mobile-only layout check");

    for (const route of ["/", "/zadachi", "/articles", "/podgotovka"]) {
      await page.goto(route);
      const widths = await page.evaluate(() => {
        const viewport = document.documentElement.clientWidth;
        const main = document.querySelector("main");
        if (!main) return { viewport, main: 0 };
        const mainRect = main.getBoundingClientRect();
        return { viewport, main: mainRect.width };
      });

      expect(widths.main, `${route} main width`).toBeGreaterThanOrEqual(
        widths.viewport - 1,
      );
    }
  });

  test("mobile answer form uses full-width touch targets", async ({ page }) => {
    test.skip(page.viewportSize()!.width >= 768, "mobile-only layout check");

    await page.goto("/zadachi/1");
    const input = page.getByLabel("Ваш ответ");
    const submit = page.getByRole("button", { name: "Проверить" });

    const inputBox = await input.boundingBox();
    const buttonBox = await submit.boundingBox();

    expect(inputBox?.width ?? 0).toBeGreaterThan(200);
    expect(buttonBox?.width ?? 0).toBeGreaterThan(200);
    expect(inputBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height ?? 0).toBeGreaterThanOrEqual(44);
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
