#!/usr/bin/env node
/**
 * Mobile scroll performance probe.
 *
 * Emulates a 390x844 phone, throttles CPU 4x, scrolls each landing route with
 * a rAF-driven scroll and records frame timings, long tasks/frames and the
 * Chromium style/layout counters.
 *
 * Usage: node scripts/perf-mobile-scroll.mjs [outfile] [baseUrl]
 */
import { chromium, devices } from "@playwright/test";
import { writeFileSync } from "node:fs";

const OUT = process.argv[2] ?? "perf-mobile.json";
const BASE = process.argv[3] ?? "http://127.0.0.1:3210";
const ROUTES = ["/", "/podgotovka"];
const SCROLL_SECONDS = 6;
const CPU_RATE = 4;
// PERF_TILT=1 re-attaches the old scroll-linked tilt/glare listener to every
// card, so the cost of that effect can be measured in isolation.
const TILT = process.env.PERF_TILT === "1";

async function measureRoute(browser, route) {
  const context = await browser.newContext({
    ...devices["Pixel 7"],
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_RATE });

  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  // Let fonts, hydration and IntersectionObserver quiet down.
  await page.waitForTimeout(1500);

  // Warm-up pass so lazy chunks are loaded before measuring.
  await page.evaluate(async () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    for (let y = 0; y <= max; y += 400) {
      window.scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
  await page.waitForTimeout(800);

  if (TILT) {
    await page.evaluate(() => {
      for (const el of document.querySelectorAll(".tilt-card")) {
        let frame = 0;
        const onScroll = () => {
          if (frame) return;
          frame = requestAnimationFrame(() => {
            frame = 0;
            const rect = el.getBoundingClientRect();
            const viewport = window.innerHeight || 1;
            const center = rect.top + rect.height / 2;
            const visibility = Math.min(
              1,
              Math.max(0, 1 - Math.abs(center - viewport / 2) / (viewport * 0.9)),
            );
            el.style.setProperty("--tilt-x", `${((center / viewport - 0.5) * 1.4).toFixed(2)}deg`);
            el.style.setProperty("--tilt-y", "0deg");
            el.style.setProperty("--glare-x", "50%");
            el.style.setProperty("--glare-y", `${(12 + (center / viewport) * 76).toFixed(1)}%`);
            el.style.setProperty("--glare-opacity", (0.06 + visibility * 0.12).toFixed(3));
          });
        };
        window.addEventListener("scroll", onScroll, { passive: true });
      }
    });
    await page.waitForTimeout(300);
  }

  const metricsBefore = await cdp.send("Performance.getMetrics");

  const traceDone = new Promise((resolve) => cdp.once("Tracing.tracingComplete", resolve));
  await cdp.send("Tracing.start", {
    categories: "devtools.timeline,blink,cc,skia,disabled-by-default-devtools.timeline",
    transferMode: "ReturnAsStream",
  });

  const result = await page.evaluate(async (seconds) => {
    const frames = [];
    const longTasks = [];
    const loaf = [];
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          longTasks.push({ start: entry.startTime, duration: entry.duration });
        }
      }).observe({ type: "longtask", buffered: false });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          loaf.push({ start: entry.startTime, duration: entry.duration });
        }
      }).observe({ type: "long-animation-frame", buffered: false });
    } catch {}

    const total = document.documentElement.scrollHeight - window.innerHeight;
    const perFrame = Math.max(1, Math.min(10, total / (seconds * 60)));
    let y = 0;
    let last = performance.now();
    const started = last;

    await new Promise((resolve) => {
      const tick = (now) => {
        frames.push(now - last);
        last = now;
        y = Math.min(total, y + perFrame);
        window.scrollTo(0, y);
        if (now - started < seconds * 1000) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });

    // Flush long-task entries recorded during the scroll.
    await new Promise((resolve) => setTimeout(resolve, 400));

    const sorted = [...frames].sort((a, b) => a - b);
    const avg = frames.reduce((n, v) => n + v, 0) / Math.max(1, frames.length);
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    return {
      frames: frames.length,
      avgFrameMs: Number(avg.toFixed(2)),
      p95FrameMs: Number(p95.toFixed(2)),
      maxFrameMs: Number((sorted[sorted.length - 1] ?? 0).toFixed(2)),
      fps: Number((1000 / avg).toFixed(1)),
      longFrames: frames.filter((v) => v > 50).length,
      longTasks,
      loaf,
      scrollHeight: total,
    };
  }, SCROLL_SECONDS);

  const metricsAfter = await cdp.send("Performance.getMetrics");

  await cdp.send("Tracing.end");
  const complete = await traceDone;
  const chunks = [];
  for (;;) {
    const chunk = await cdp.send("IO.read", { handle: complete.stream, size: 4_000_000 });
    chunks.push(chunk.data);
    if (chunk.eof) break;
  }
  await cdp.send("IO.close", { handle: complete.stream });
  const traceCounts = {};
  try {
    const trace = JSON.parse(chunks.join(""));
    for (const event of trace.traceEvents ?? []) {
      if (!event.ph || event.ph !== "X") continue;
      const name = event.name;
      if (
        ![
          "UpdateLayoutTree",
          "Layout",
          "Paint",
          "RasterTask",
          "CompositeLayers",
          "UpdateLayer",
        ].includes(name)
      ) {
        continue;
      }
      const entry = (traceCounts[name] ??= { count: 0, ms: 0 });
      entry.count += 1;
      entry.ms += (event.dur ?? 0) / 1000;
    }
    for (const entry of Object.values(traceCounts)) entry.ms = Number(entry.ms.toFixed(1));
  } catch (error) {
    traceCounts.error = String(error);
  }

  const computed = await page.evaluate(() => {
    const read = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const s = getComputedStyle(el);
      return {
        filter: s.filter,
        backdropFilter: s.backdropFilter || s.webkitBackdropFilter,
        willChange: s.willChange,
        backgroundAttachment: s.backgroundAttachment,
        transform: s.transform,
      };
    };
    return {
      body: read("body"),
      header: read(".site-header"),
      stickyCta: read('nav[aria-label="Быстрая запись на пробное"]'),
      fallbackGlow: read(".world-fallback-glow-a"),
      fallbackOrb: read(".world-fallback-orb"),
      reveal: read(".lp [data-r]"),
      viz: read(".lp .viz"),
      tiltCard: read(".tilt-card"),
      tiltGlare: read(".tilt-glare"),
      mobileWorld: read(".lp-mobile-world"),
      horizontalOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      tiltCards: document.querySelectorAll(".tilt-card").length,
    };
  });

  await context.close();

  const pick = (metrics) => {
    const map = Object.fromEntries(metrics.metrics.map((m) => [m.name, m.value]));
    return map;
  };
  const before = pick(metricsBefore);
  const after = pick(metricsAfter);
  const delta = {
    LayoutCount: after.LayoutCount - before.LayoutCount,
    RecalcStyleCount: after.RecalcStyleCount - before.RecalcStyleCount,
    LayoutDuration: Number(
      (after.LayoutDuration - before.LayoutDuration).toFixed(4),
    ),
    RecalcStyleDuration: Number(
      (after.RecalcStyleDuration - before.RecalcStyleDuration).toFixed(4),
    ),
    ScriptDuration: Number((after.ScriptDuration - before.ScriptDuration).toFixed(4)),
    TaskDuration: Number((after.TaskDuration - before.TaskDuration).toFixed(4)),
  };

  const longTaskTotal = result.longTasks.reduce((n, t) => n + t.duration, 0);

  return {
    route,
    cpuRate: CPU_RATE,
    frameCount: result.frames,
    avgFrameMs: result.avgFrameMs,
    p95FrameMs: result.p95FrameMs,
    maxFrameMs: result.maxFrameMs,
    fps: result.fps,
    longFrames: result.longFrames,
    longTasks: result.longTasks.length,
    longTaskTotalMs: Number(longTaskTotal.toFixed(1)),
    loafCount: result.loaf.length,
    scrollHeight: result.scrollHeight,
    counters: delta,
    trace: traceCounts,
    computed,
  };
}

async function main() {
  const browser = await chromium.launch();
  const out = {
    base: BASE,
    takenAt: new Date().toISOString(),
    tiltEmulated: TILT,
    routes: [],
  };
  for (const route of ROUTES) {
    const entry = await measureRoute(browser, route);
    out.routes.push(entry);
    console.log(
      `${route}: fps=${entry.fps} avg=${entry.avgFrameMs}ms p95=${entry.p95FrameMs}ms longFrames=${entry.longFrames} longTasks=${entry.longTasks} layout=${entry.counters.LayoutCount} recalc=${entry.counters.RecalcStyleCount}`,
    );
  }
  await browser.close();
  writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");
  console.log(`Wrote ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
