import { expect, test } from "@playwright/test";

async function scrollThrough(page: import("@playwright/test").Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.round(window.innerHeight * 0.55));
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    }
  });
}

test.describe("landing motion", () => {
  test("process steps become active while scrolling", async ({ page }) => {
    await page.goto("/");

    const process = page.locator("#process");
    await process.scrollIntoViewIfNeeded();

    await expect(process.locator(".step.on").first()).toBeAttached();
    await expect(process.locator(".node.on").first()).toBeAttached();
  });

  test("scroll-revealed content is visible at the bottom of the page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
    await scrollThrough(page);

    await expect
      .poll(() =>
        page.evaluate(() => {
          const items = Array.from(
            document.querySelectorAll<HTMLElement>("#subjects [data-r]"),
          );
          return (
            items.length > 0 &&
            items.every((el) => Number.parseFloat(getComputedStyle(el).opacity) >= 0.99)
          );
        }),
      )
      .toBe(true);
  });

  test("reduced motion keeps the hero visible and removes continuous motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: /Сложное/ }),
    ).toBeVisible();

    const running = await page.evaluate(
      () =>
        document.getAnimations().filter((animation) => {
          if (animation.playState !== "running") return false;
          const duration = Number(animation.effect?.getTiming().duration ?? 0);
          return duration > 10;
        }).length,
    );
    expect(running).toBe(0);
  });
});
