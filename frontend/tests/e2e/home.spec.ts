import { expect, test } from "@playwright/test";

const SECTION_HEADINGS = [
  "Два направления",
  "Как проходят занятия",
  "Давайте разберёмся",
];

test.describe("home page", () => {
  test("shows the hero and every main section", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: /Сложное/ }),
    ).toBeVisible();

    for (const heading of SECTION_HEADINGS) {
      await expect(
        page.getByRole("heading", { name: new RegExp(heading) }).first(),
      ).toBeAttached();
    }

    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("renders the hero without KaTeX on the landing page", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /Сложное/ }),
    ).toBeVisible();
    await expect(page.locator(".katex")).toHaveCount(0);
  });

  test("has no placeholder links and no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(await page.locator('a[href="#"]').count()).toBe(0);
    expect(errors).toEqual([]);
  });

  test("every scroll-revealed block becomes visible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });

    await expect
      .poll(async () => {
        await page.evaluate(() =>
          window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
        );
        return page.evaluate(() => {
          const all = Array.from(document.querySelectorAll<HTMLElement>("[data-r]"));
          return (
            all.length > 0 &&
            all.every(
              (el) =>
                el.closest("[hidden]") !== null ||
                Number.parseFloat(getComputedStyle(el).opacity) >= 0.99,
            )
          );
        });
      })
      .toBe(true);
  });

  test("reveal still works after client-side navigation", async ({ page }) => {
    await page.goto("/articles");
    await page.getByRole("link", { name: "Главная" }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await page.waitForLoadState("networkidle");
    await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });

    await expect
      .poll(async () => {
        await page.evaluate(() =>
          window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
        );
        return page.evaluate(() => {
          const all = Array.from(document.querySelectorAll<HTMLElement>("[data-r]"));
          return (
            all.length > 0 &&
            all.every(
              (el) =>
                el.closest("[hidden]") !== null ||
                Number.parseFloat(getComputedStyle(el).opacity) >= 0.99,
            )
          );
        });
      })
      .toBe(true);
  });

  test("process steps activate on scroll", async ({ page }) => {
    await page.goto("/");
    await page.locator("#process").scrollIntoViewIfNeeded();

    await expect(page.locator("#process .step.on").first()).toBeAttached();
  });

  test("subject cards become a swipeable peek carousel on mobile", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    const rail = page.locator(".lp .sub .grid");
    const metrics = await rail.evaluate((element) => ({
      overflowX: getComputedStyle(element).overflowX,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    }));
    const dots = page.locator('[aria-label="Направления: прогресс"]');

    if (isMobile) {
      expect(metrics.overflowX).toBe("auto");
      expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
      await expect(dots).toBeVisible();

      const first = page.locator(".lp .sub .grid > [data-peek-item]").first();
      await expect(first).toHaveAttribute("data-active", "");
      const box = await first.boundingBox();
      const viewport = page.viewportSize()?.width ?? 375;
      expect(box).not.toBeNull();
      expect(Math.abs(box!.x + box!.width / 2 - viewport / 2)).toBeLessThan(2);
    } else {
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
      await expect(dots).toBeHidden();
    }
  });

  test("the 2.5D fallback is live on phones and hidden on desktop", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    const layer = page.locator(".lp-mobile-world");

    if (!isMobile) {
      await expect(layer).toBeHidden();
      return;
    }

    await expect(layer).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 800));
    await expect
      .poll(() =>
        page.evaluate(() => {
          const fallback = document.querySelector<HTMLElement>(
            ".lp-mobile-world .world-fallback",
          );
          if (!fallback) return "0px";
          return getComputedStyle(fallback)
            .getPropertyValue("--fallback-scroll-a")
            .trim();
        }),
      )
      .not.toBe("0px");
  });
});
