import { expect, test } from "@playwright/test";

test.describe("no-JS content", () => {
  test.use({ javaScriptEnabled: false });

  test("home keeps its editorial content without JavaScript", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("понимания.");
    await expect(page.getByText(/Не смотрите\s+решение/)).toBeVisible();
    await expect(page.getByText("Вопросы и ответы")).toBeVisible();
    await expect(page.locator(".field-fallback").first()).toBeVisible();
    await expect(page.getByText("Интерактивная проверка требует JavaScript.")).toBeVisible();
  });

  test("tutoring page keeps hero, facts and form without JavaScript", async ({ page }) => {
    await page.goto("/podgotovka");

    await expect(page.locator("h1")).toContainText("системный");
    await expect(page.getByText("Как устроены занятия")).toBeVisible();
    await expect(page.locator("[data-lead-form]")).toBeVisible();
    await expect(
      page.getByRole("group", { name: "Карта тем — интерактивный пример" }),
    ).toBeAttached();
  });
});

test.describe("motion accessibility", () => {
  test.use({ reducedMotion: "reduce" });

  test("reduced motion turns animation cycles off and keeps content visible", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    await expect(page.locator("h1")).toContainText("понимания.");

    const marqueeAnimation = await page
      .locator(".marquee-track")
      .first()
      .evaluate((element) => getComputedStyle(element).animationName);
    expect(marqueeAnimation).toBe("none");

    const surfaceDisplay = await page
      .locator(".field-surface")
      .first()
      .evaluate((element) => getComputedStyle(element).display);
    expect(surfaceDisplay).toBe("none");

    await expect(page.getByText("Вопросы и ответы")).toBeVisible();
  });
});

test.describe("page behaviour", () => {
  test("has no console errors and no meaningful layout shift", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));

    await page.goto("/");
    await page.evaluate(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEntry[]) {
          const shift = entry as PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          };
          if (!shift.hadRecentInput) {
            (window as unknown as { __cls: number }).__cls += shift.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.waitForTimeout(1200);

    const cls = await page.evaluate(
      () => (window as unknown as { __cls: number }).__cls,
    );
    expect(cls).toBeLessThan(0.1);
    expect(errors).toEqual([]);
  });

  test("request anchor lands on the lead form", async ({ page }) => {
    await page.goto("/podgotovka#request");

    await expect(page).toHaveURL(/#request$/);
    await expect(page.locator("#request [data-lead-form]")).toBeVisible();
  });

  test("mobile sticky CTA appears after the hero", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 900));

    await expect(
      page.locator('nav[aria-label="Быстрая запись на пробное"]'),
    ).toBeVisible({ timeout: 5000 });
  });
});
