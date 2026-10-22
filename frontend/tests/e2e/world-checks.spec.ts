import { expect, test, type Page } from "@playwright/test";

const ROUTES = ["/", "/podgotovka"] as const;

async function noHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth <= doc.clientWidth + 1;
  });
}

async function countPinned(page: Page): Promise<number> {
  return page.locator("[data-pinned]").count();
}

async function countAiPositioning(page: Page): Promise<number> {
  const text = await page.locator("body").innerText();
  return (text.match(/Нейросеть даёт решение/g) ?? []).length;
}

async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

async function smallTextNodes(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const allowed = (el: Element) =>
      el.closest(".g-text, .code, .ln, svg, .katex") !== null;
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
      if (allowed(el)) continue;
      const hasText = Array.from(el.childNodes).some(
        (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim().length > 0,
      );
      if (!hasText) continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size > 0 && size < 14) {
        out.push(`${el.tagName}.${el.className}: ${size}px "${(el.textContent ?? "").trim().slice(0, 30)}"`);
      }
    }
    return out;
  });
}

test.describe("world redesign — layout and a11y guards", () => {
  for (const route of ROUTES) {
    test(`${route}: no horizontal overflow, ≤1 pin, ≤1 AI_POSITIONING, no tiny text`, async ({ page }) => {
      const errors = await collectConsoleErrors(page);
      await page.goto(`${route}?world=force`, { waitUntil: "load" });
      await page.waitForTimeout(1500);

      expect(await noHorizontalOverflow(page)).toBe(true);
      expect(await countPinned(page)).toBeLessThanOrEqual(1);
      expect(await countAiPositioning(page)).toBeLessThanOrEqual(1);

      const tiny = await smallTextNodes(page);
      expect(tiny).toEqual([]);

      // No console errors once the world has initialised.
      expect(errors).toEqual([]);
    });
  }

  test("pinned episode block fits inside the viewport on desktop", async ({ page }) => {
    await page.goto("/?world=force", { waitUntil: "load" });
    await page.waitForTimeout(1500);

    const pinned = page.locator("[data-pinned]");
    await expect(pinned).toHaveCount(1);

    const fits = await page.evaluate(() => {
      const el = document.querySelector("[data-pinned]");
      if (!el) return false;
      const inner = el.querySelector(".pinned-sticky");
      if (!inner) return true;
      const r = inner.getBoundingClientRect();
      return r.height <= window.innerHeight - 64;
    });
    expect(fits).toBe(true);
  });

  test("content is readable without JS and the form is present", async ({ page }) => {
    await page.route("**/*.js", (route) => route.abort());
    await page.route("**/*.js.map", (route) => route.abort());
    await page.goto("/podgotovka", { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-lead-form]").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Индивидуальные занятия/ })).toBeVisible();
  });

  test("reduced motion disables pinning and Lenis", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?world=force", { waitUntil: "load" });
    await page.waitForTimeout(1500);

    // Pinned episodes fall back to a plain vertical list (no sticky transform).
    const sticky = await page.evaluate(() => {
      const inner = document.querySelector(".pinned-sticky");
      if (!inner) return true;
      const style = getComputedStyle(inner);
      return style.position === "sticky" || style.position === "fixed";
    });
    expect(sticky).toBe(false);

    // Reveal content is visible immediately.
    const hiddenReveals = await page.evaluate(() => {
      return Array.from(document.querySelectorAll<HTMLElement>(".reveal")).filter(
        (el) => !el.dataset.revealIn && getComputedStyle(el).opacity === "0",
      ).length;
    });
    expect(hiddenReveals).toBe(0);
  });
});
