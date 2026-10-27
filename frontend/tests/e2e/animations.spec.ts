import { expect, test } from "@playwright/test";

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
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    );

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
