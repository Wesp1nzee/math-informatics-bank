// Standalone screenshot harness for the world redesign.
// Run: node scripts/world-screenshots.mjs  (requires `next start` on :3210)
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://127.0.0.1:3210";
const OUT = join(process.cwd(), "screenshots", "world");
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "390x844", width: 390, height: 844 },
  { name: "360x640", width: 360, height: 640 },
];

const PAGES = ["home", "podgotovka"];

function shot(page, name) {
  return page.screenshot({ path: join(OUT, `${name}.png`) });
}

async function scrollTo(page, fraction) {
  const h = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  );
  await page.evaluate((y) => window.scrollTo(0, y), h * fraction);
  await page.waitForTimeout(700);
}

async function scrollToSelector(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ block: "start" });
  }, selector);
  await page.waitForTimeout(700);
}

async function run() {
  const browser = await chromium.launch({
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--use-gl=angle"],
  });

  for (const vp of VIEWPORTS) {
    for (const route of PAGES) {
      const path = route === "home" ? "/" : "/podgotovka";
      const url = `${BASE}${path}?world=force`;
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();
      const errors = [];
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      page.on("pageerror", (e) => errors.push(String(e)));

      await page.goto(url, { waitUntil: "load" });
      await page.waitForTimeout(2500);

      await shot(page, `${vp.name}-${route}-hero`);

      // Pinned episode: find and walk through it.
      const hasPin = await page.evaluate(() => {
        const el = document.querySelector("[data-pinned]");
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top < window.innerHeight * 2 && r.top > -window.innerHeight * 2;
      });

      if (hasPin) {
        await scrollToSelector(page, "[data-pinned]");
        await page.waitForTimeout(900);
        await shot(page, `${vp.name}-${route}-pin-start`);
        // Scroll through the ~2.4vh pin distance.
        const pinHeight = await page.evaluate(() => {
          const el = document.querySelector("[data-pinned]");
          return el ? el.getBoundingClientRect().height : window.innerHeight * 2.4;
        });
        await page.mouse.wheel(0, pinHeight * 0.5);
        await page.waitForTimeout(900);
        await shot(page, `${vp.name}-${route}-pin-mid`);
        await page.mouse.wheel(0, pinHeight * 0.7);
        await page.waitForTimeout(900);
        await shot(page, `${vp.name}-${route}-pin-end`);
      }

      // Walk the rest of the page in steps.
      await page.evaluate(() => window.scrollTo(0, 0));
      for (let i = 1; i <= 6; i += 1) {
        await scrollTo(page, i / 6);
        await shot(page, `${vp.name}-${route}-step-${i}`);
      }

      // Finale / summit.
      await scrollTo(page, 1);
      await shot(page, `${vp.name}-${route}-end`);

      // World stats.
      const stats = await page.evaluate(() => window.__worldStats ?? null);
      const mode = await page.evaluate(() => window.__worldMode ?? "unknown");
      console.log(
        `${vp.name} ${route}: mode=${mode} stats=${JSON.stringify(stats)} errors=${errors.length}`,
      );
      if (errors.length) console.log("  errors:", errors.slice(0, 3));

      await context.close();
    }
  }

  await browser.close();
  console.log("DONE ->", OUT);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
