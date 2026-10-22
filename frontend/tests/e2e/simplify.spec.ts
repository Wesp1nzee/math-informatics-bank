import { expect, test } from "@playwright/test";

const PAGES = ["/", "/podgotovka"];

for (const path of PAGES) {
  test.describe(`${path} simplification rules`, () => {
    test("has no text smaller than 14px except code and SVG ticks", async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const result = await page.evaluate(() => {
        const tooSmall: { text: string; size: number; tag: string }[] = [];
        const badSvgTicks: { text: string; size: number }[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const text = node.textContent?.trim();
          if (!text || !node.parentElement) continue;
          const element = node.parentElement;
          if (element.closest("pre, code")) continue;
          const size = Number.parseFloat(getComputedStyle(element).fontSize);
          if (element.closest("svg")) {
            if (size < 12) badSvgTicks.push({ text: text.slice(0, 30), size });
            continue;
          }
          if (size < 14) {
            tooSmall.push({
              text: text.slice(0, 40),
              size,
              tag: element.tagName,
            });
          }
        }

        return { tooSmall, badSvgTicks };
      });

      expect(result.tooSmall).toEqual([]);
      expect(result.badSvgTicks).toEqual([]);
    });

    test("has no sticky scenes and no scroll-driven animations", async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const sticky = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("body *")]
          .filter((element) => {
            if (getComputedStyle(element).position !== "sticky") return false;
            if (element.closest("header")) return false;
            if (element.closest('nav[aria-label="Быстрая запись на пробное"]')) {
              return false;
            }
            return true;
          })
          .map((element) => `${element.tagName}.${element.className}`),
      );
      expect(sticky).toEqual([]);

      const scrollAnimations = await page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => {
              const timeline = animation.timeline as unknown as {
                constructor?: { name?: string };
              } | null;
              return Boolean(timeline?.constructor?.name?.includes("Scroll"));
            }).length,
      );
      expect(scrollAnimations).toBe(0);
    });

    test("mentions AI positioning no more than once", async ({ page }) => {
      await page.goto(path);
      const text = await page.locator("body").innerText();
      const matches = text.match(/Нейросеть даёт решение/g) ?? [];
      expect(matches.length).toBeLessThanOrEqual(1);
    });

    test("has no console errors and near-zero layout shift", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(String(error)));

      await page.goto(path);
      await page.evaluate(() => {
        (window as unknown as { __cls: number }).__cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
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
      expect(cls).toBeLessThan(0.05);
      expect(errors).toEqual([]);
    });
  });
}

test.describe("no-JS and reduced motion", () => {
  test.use({ javaScriptEnabled: false });

  test("home and tutoring content is server rendered", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Попробуйте сами" })).toBeVisible();
    await expect(page.locator('[role="tabpanel"]')).toHaveCount(2);
    await expect(page.locator("[data-static-code]")).toBeVisible();

    await page.goto("/podgotovka");
    await expect(page.locator("[data-lead-form]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Как проходит пробное" })).toBeVisible();
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nothing is moving after load", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(700);
    const running = await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((animation) => {
            if (animation.playState !== "running") return false;
            const duration = Number(
              animation.effect?.getTiming().duration ?? 0,
            );
            return duration > 10;
          }).length,
    );
    expect(running).toBe(0);
  });
});
