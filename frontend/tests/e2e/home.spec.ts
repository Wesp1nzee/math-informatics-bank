import { expect, test, type Page } from "@playwright/test";

/**
 * Scrolls the page in viewport-sized steps. IntersectionObserver reveals are
 * driven by actual intersections, so jumping straight to the bottom would
 * (correctly) leave skipped blocks un-revealed.
 */
async function scrollThrough(page: Page): Promise<void> {
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
    await scrollThrough(page);

    await expect
      .poll(() =>
        page.evaluate(() => {
          const all = Array.from(document.querySelectorAll<HTMLElement>("[data-r]"));
          return (
            all.length > 0 &&
            all.every(
              (el) =>
                el.closest("[hidden]") !== null ||
                Number.parseFloat(getComputedStyle(el).opacity) >= 0.99,
            )
          );
        }),
      )
      .toBe(true);
  });

  test("reveal still works after client-side navigation", async ({ page }) => {
    await page.goto("/articles");
    await page.getByRole("link", { name: "Главная" }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await page.waitForLoadState("networkidle");
    await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
    await scrollThrough(page);

    await expect
      .poll(() =>
        page.evaluate(() => {
          const all = Array.from(document.querySelectorAll<HTMLElement>("[data-r]"));
          return (
            all.length > 0 &&
            all.every(
              (el) =>
                el.closest("[hidden]") !== null ||
                Number.parseFloat(getComputedStyle(el).opacity) >= 0.99,
            )
          );
        }),
      )
      .toBe(true);
  });

  test("process steps activate on scroll", async ({ page }) => {
    await page.goto("/");
    await page.locator("#process").scrollIntoViewIfNeeded();

    await expect(page.locator("#process .step.on").first()).toBeAttached();
  });

  test("subject cards stack vertically on phones and keep two columns on desktop", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    await page.locator("#subjects").scrollIntoViewIfNeeded();

    const grid = page.locator("#subjects .grid");
    const cards = grid.locator(":scope > div");
    await expect(cards).toHaveCount(2);
    await expect(page.locator('[aria-label="Направления: прогресс"]')).toHaveCount(0);
    await expect(grid.locator("[data-peek-item]")).toHaveCount(0);

    const metrics = await grid.evaluate((element) => ({
      display: getComputedStyle(element).display,
      overflowX: getComputedStyle(element).overflowX,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    }));
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();

    expect(metrics.display).toBe("grid");
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth + 1,
      ),
    ).toBe(true);

    if (isMobile) {
      // One column: same left edge, the second card below the first.
      expect(Math.abs(first!.x - second!.x)).toBeLessThan(1);
      expect(second!.y).toBeGreaterThan(first!.y + first!.height);
      const gap = second!.y - (first!.y + first!.height);
      expect(gap).toBeGreaterThanOrEqual(39);
      expect(gap).toBeLessThanOrEqual(49);

      const svg = await page.locator("#math svg.viz").boundingBox();
      expect(svg).not.toBeNull();
      expect(svg!.width).toBeGreaterThan(first!.width * 0.95);
    } else {
      // Two columns: side by side, offset card included.
      expect(second!.x).toBeGreaterThanOrEqual(first!.x + first!.width);
      expect(Math.abs(first!.y - second!.y)).toBeLessThan(200);
    }
  });

  test("both subject illustrations animate when they enter the viewport", async ({
    page,
  }) => {
    await page.goto("/");

    const sample = (selector: string, attribute: string) =>
      page.evaluate(
        async ({ selector, attribute }) => {
          const element = document.querySelector(selector);
          if (!element) return { found: false, changed: false };
          const start = performance.now();
          const firstValue = element.getAttribute(attribute);
          while (performance.now() - start < 8000) {
            await new Promise((resolve) => setTimeout(resolve, 120));
            if (element.getAttribute(attribute) !== firstValue) {
              return { found: true, changed: true };
            }
          }
          return { found: true, changed: false };
        },
        { selector, attribute },
      );

    await page.locator("#math svg.viz").scrollIntoViewIfNeeded();
    expect(await sample("#mDot", "transform")).toEqual({
      found: true,
      changed: true,
    });

    await page.locator("#info svg.viz").scrollIntoViewIfNeeded();
    expect(await sample("#aD", "cx")).toEqual({ found: true, changed: true });
  });

  test("heavy blur is desktop-only", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) {
      await expect(page.locator(".world-fallback-glow-a")).toBeAttached();
    }

    const styles = await page.evaluate(() => {
      const read = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const style = getComputedStyle(element);
        return {
          filter: style.filter,
          backdropFilter: style.backdropFilter,
          willChange: style.willChange,
          backgroundAttachment: style.backgroundAttachment,
          transform: style.transform,
          display: style.display,
        };
      };
      return {
        body: read("body"),
        header: read(".site-header"),
        glow: read(".world-fallback-glow-a"),
        tilt: read(".tilt-card"),
        glare: read(".tilt-glare"),
        viz: read(".lp .viz"),
      };
    });

    expect(styles.body).not.toBeNull();
    expect(styles.header).not.toBeNull();

    if (isMobile) {
      expect(styles.body!.backgroundAttachment).toBe("scroll");
      expect(styles.header!.backdropFilter).toBe("none");
      expect(styles.glow).not.toBeNull();
      expect(styles.glow!.filter).toBe("none");
      expect(styles.tilt!.transform).toBe("none");
      expect(styles.glare!.display).toBe("none");
      expect(styles.viz!.willChange).toBe("auto");
    } else {
      expect(styles.body!.backgroundAttachment).toContain("fixed");
      expect(styles.header!.backdropFilter).toContain("blur(26px)");
    }
  });

  test("the 2.5D fallback is static on phones and hidden on desktop", async ({
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

    const read = () =>
      page.evaluate(() => {
        const fallback = document.querySelector<HTMLElement>(
          ".lp-mobile-world .world-fallback",
        );
        const glow = document.querySelector<HTMLElement>(".world-fallback-glow-a");
        const orb = document.querySelector<HTMLElement>(".world-fallback-orb");
        const grain = document.querySelector<HTMLElement>(".world-fallback-grain");
        if (!fallback || !glow || !orb || !grain) return null;
        return {
          scrollVar: fallback.style.getPropertyValue("--fallback-scroll-a"),
          glowFilter: getComputedStyle(glow).filter,
          orbFilter: getComputedStyle(orb).filter,
          glowAnimation: getComputedStyle(glow).animationName,
          grainDisplay: getComputedStyle(grain).display,
          runningAnimations: fallback.getAnimations({ subtree: true }).length,
        };
      });

    const before = await read();
    expect(before).not.toBeNull();
    expect(before).toEqual({
      scrollVar: "",
      glowFilter: "none",
      orbFilter: "none",
      glowAnimation: "none",
      grainDisplay: "none",
      runningAnimations: 0,
    });

    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(300);

    // Nothing on the fallback reacts to scroll: same computed values, no vars.
    expect(await read()).toEqual(before);
  });
});
