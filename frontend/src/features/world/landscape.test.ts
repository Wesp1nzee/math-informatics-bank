import { describe, expect, it } from "vitest";

import {
  buildPathA,
  buildPathB,
  buildThoughtPath,
  heightAt,
  LANDSCAPE,
  PATH_LIFT,
  PEAK,
  PIT,
  START,
} from "@/features/world/landscape";

const BASE = { ...LANDSCAPE, relief: 1, morph: 1, signal: 1 };

describe("heightAt", () => {
  it("peaks near the summit and is high on the peak", () => {
    const atPeak = heightAt(PEAK[0], PEAK[1], BASE);
    const far = heightAt(-9, -9, BASE);
    expect(atPeak).toBeGreaterThan(far);
  });

  it("dips into the pit when signal is high", () => {
    const inside = heightAt(PIT[0], PIT[1], BASE);
    const healed = heightAt(PIT[0], PIT[1], { ...BASE, signal: 0 });
    expect(inside).toBeLessThan(healed);
  });

  it("flattens when morph is zero", () => {
    expect(heightAt(PEAK[0], PEAK[1], { ...BASE, morph: 0 })).toBeCloseTo(0, 5);
  });
});

describe("paths", () => {
  it("path A starts at the plateau and ends at the peak", () => {
    const a = buildPathA();
    const first = a[0];
    const last = a[a.length - 1];
    expect(Math.hypot(first[0] - START[0], first[1] - START[1])).toBeLessThan(0.5);
    expect(Math.hypot(last[0] - PEAK[0], last[1] - PEAK[1])).toBeLessThan(0.5);
  });

  it("path B equals path A when signal is zero", () => {
    const a = buildPathA();
    const b = buildPathB(0);
    expect(b.length).toBe(a.length);
    for (let i = 0; i < a.length; i += 1) {
      expect(b[i][0]).toBeCloseTo(a[i][0], 5);
      expect(b[i][1]).toBeCloseTo(a[i][1], 5);
    }
  });

  it("path B approaches the pit when signal is high", () => {
    const b = buildPathB(1);
    let closest = Infinity;
    for (const p of b) {
      closest = Math.min(closest, Math.hypot(p[0] - PIT[0], p[1] - PIT[1]));
    }
    const t = buildThoughtPath();
    let tClosest = Infinity;
    for (const p of t) {
      tClosest = Math.min(tClosest, Math.hypot(p[0] - PIT[0], p[1] - PIT[1]));
    }
    expect(closest).toBeLessThan(tClosest + 0.6);
  });
});

describe("constants", () => {
  it("path lift exceeds the GLSL noise amplitude", () => {
    expect(PATH_LIFT).toBeGreaterThan(0.06);
  });
});
