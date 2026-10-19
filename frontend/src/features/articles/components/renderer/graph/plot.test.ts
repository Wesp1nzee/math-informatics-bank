import { describe, expect, it } from "vitest";

import type { GraphViewport } from "@/features/articles/types";

import { compileExpression } from "@/features/articles/components/renderer/graph/expression";
import {
  buildPath,
  formatTick,
  mapX,
  mapY,
  niceStep,
  niceTicks,
  sampleValue,
  samplesForLayout,
  type PlotLayout,
} from "@/features/articles/components/renderer/graph/plot";

const viewport: GraphViewport = {
  x_min: -5,
  x_max: 5,
  y_min: -5,
  y_max: 5,
};
const layout: PlotLayout = { width: 480, height: 280, padding: 32 };
const plotHeight = layout.height - 2 * layout.padding;

type Command = { type: "M" | "L"; x: number; y: number };

function parsePath(path: string): Command[] {
  return (path.match(/[ML][^ML]+/g) ?? []).map((command) => {
    const [x, y] = command.slice(1).trim().split(/\s+/).map(Number);
    return { type: command[0] as "M" | "L", x, y };
  });
}

function expectNoPhantomSegments(path: string) {
  const commands = parsePath(path);
  let previous: Command | null = null;
  for (const command of commands) {
    if (command.type === "L" && previous) {
      const oppositeSides =
        (previous.y < layout.padding && command.y > layout.height - layout.padding) ||
        (previous.y > layout.height - layout.padding && command.y < layout.padding);
      expect(oppositeSides).toBe(false);
      expect(Math.abs(command.y - previous.y)).toBeLessThanOrEqual(plotHeight);
    }
    previous = command;
  }
  expect(commands.filter((command) => command.type === "M").length).toBeGreaterThan(1);
}

describe("plot", () => {
  it("maps viewport corners to the padded plot area", () => {
    expect(mapX(-5, viewport, layout)).toBe(32);
    expect(mapX(5, viewport, layout)).toBe(448);
    expect(mapY(-5, viewport, layout)).toBe(248);
    expect(mapY(5, viewport, layout)).toBe(32);
  });

  it("builds an SVG path for a function", () => {
    const path = buildPath(compileExpression("x^2"), {}, viewport, layout, 20);
    expect(path).toContain("M");
    expect(path).toContain("L");
  });

  it("starts new segments at asymptotes", () => {
    const path = buildPath(compileExpression("1 / x"), {}, viewport, layout, 200);
    expect(path).not.toBeNull();
    expect((path?.match(/M/g) ?? []).length).toBeGreaterThan(1);
  });

  it("returns null for an invalid viewport", () => {
    expect(
      buildPath(
        compileExpression("x"),
        {},
        { x_min: 1, x_max: 1, y_min: -1, y_max: 1 },
        layout,
      ),
    ).toBeNull();
  });

  it("samples values and returns null outside the domain", () => {
    const sqrt = compileExpression("sqrt(x)");
    expect(sampleValue(sqrt, 4, {})).toBe(2);
    expect(sampleValue(sqrt, -1, {})).toBeNull();
  });

  it("does not connect the branches of 1 / x", () => {
    const path = buildPath(compileExpression("1 / x"), {}, viewport, layout);
    expect(path).not.toBeNull();
    expectNoPhantomSegments(path as string);
  });

  it("does not connect tan(x) across its asymptotes", () => {
    const path = buildPath(compileExpression("tan(x)"), {}, viewport, layout);
    expect(path).not.toBeNull();
    expectNoPhantomSegments(path as string);
  });

  it("clamps extreme pixels instead of producing enormous coordinates", () => {
    const path = buildPath(compileExpression("1 / x"), {}, viewport, layout) as string;
    for (const command of parsePath(path)) {
      expect(Math.abs(command.y)).toBeLessThanOrEqual(1e4);
    }
  });

  it("uses roughly 1–2 samples per plot pixel within 240..600", () => {
    expect(samplesForLayout(layout)).toBe(600);
    expect(samplesForLayout({ width: 200, height: 280, padding: 32 })).toBe(240);
    expect(samplesForLayout({ width: 1440, height: 280, padding: 32 })).toBe(600);
  });

  it("builds nice 1-2-5 ticks and formats their labels", () => {
    expect(niceStep(10)).toBe(2);
    expect(niceTicks(-5, 5)).toEqual([-4, -2, 0, 2, 4]);
    expect(niceTicks(-0.5, 0.5)).toEqual([-0.4, -0.2, 0, 0.2, 0.4]);
    expect(formatTick(-4, 2)).toBe("-4");
    expect(formatTick(0.2, 0.2)).toBe("0.2");
    expect(formatTick(1e6, 5e5)).toBe("1e6");
  });
});
