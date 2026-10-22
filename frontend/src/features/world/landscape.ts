import type { Vec2 } from "@/features/world/types";

/**
 * The landscape is a weighted sum of four Gaussians defined once here and
 * mirrored identically in the GLSL vertex shader (via uniforms). The JS
 * `heightAt` ignores the small GLSL-only noise detail, so paths and the marker
 * sit exactly on the smooth surface.
 */
export type LandscapeParams = {
  peakAmp: number;
  peakX: number;
  peakZ: number;
  peakSigma: number;

  plateauAmp: number;
  plateauX: number;
  plateauZ: number;
  plateauSigma: number;

  ridgeAmp: number;
  ridgeX: number;
  ridgeZ: number;
  ridgeSigma: number;

  pitAmp: number;
  pitX: number;
  pitZ: number;
  pitSigma: number;

  relief: number;
  morph: number;
  signal: number;
};

export const LANDSCAPE: Omit<LandscapeParams, "relief" | "morph" | "signal"> = {
  peakAmp: 4.0,
  peakX: 6.5,
  peakZ: -4.5,
  peakSigma: 3.4,

  plateauAmp: 0.5,
  plateauX: -7.5,
  plateauZ: 3.5,
  plateauSigma: 4.2,

  ridgeAmp: 1.6,
  ridgeX: 0,
  ridgeZ: 7,
  ridgeSigma: 7,

  pitAmp: -2.4,
  pitX: -1.5,
  pitZ: -0.5,
  pitSigma: 1.7,
};

/** World extent: x and z range from -WORLD_SIZE/2 to +WORLD_SIZE/2. */
export const WORLD_SIZE = 24;

/** Lift applied to paths above the smooth surface (above the 0.06 GLSL noise). */
export const PATH_LIFT = 0.1;

export const START: Vec2 = [LANDSCAPE.plateauX, LANDSCAPE.plateauZ];
export const PEAK: Vec2 = [LANDSCAPE.peakX, LANDSCAPE.peakZ];
export const PIT: Vec2 = [LANDSCAPE.pitX, LANDSCAPE.pitZ];

function gaussian(dx: number, dz: number, sigma: number): number {
  return Math.exp(-(dx * dx + dz * dz) / (2 * sigma * sigma));
}

export function heightAt(
  x: number,
  z: number,
  p: LandscapeParams = {
    ...LANDSCAPE,
    relief: 1,
    morph: 1,
    signal: 1,
  },
): number {
  const h =
    p.peakAmp * gaussian(x - p.peakX, z - p.peakZ, p.peakSigma) +
    p.plateauAmp * gaussian(x - p.plateauX, z - p.plateauZ, p.plateauSigma) +
    p.ridgeAmp * gaussian(x - p.ridgeX, z - p.ridgeZ, p.ridgeSigma) +
    p.pitAmp * p.signal * gaussian(x - p.pitX, z - p.pitZ, p.pitSigma);

  return p.relief * p.morph * h;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Catmull-Rom spline through control points; passes through every point. */
function catmullRom(points: readonly Vec2[], samples: number): Vec2[] {
  const pts = [...points];
  const out: Vec2[] = [];

  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];

    const steps = i === pts.length - 2 ? samples - (pts.length - 2) * (samples / (pts.length - 1)) : samples / (pts.length - 1);
    const count = Math.max(1, Math.round(steps));

    for (let j = 0; j < count; j += 1) {
      const t = j / count;
      const t2 = t * t;
      const t3 = t2 * t;
      const x =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const z =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      out.push([x, z]);
    }
  }

  out.push([...pts[pts.length - 1]] as Vec2);
  return out;
}

/** Arc control point for path A: midpoint of start→peak pushed away from the pit. */
function arcControl(): Vec2 {
  const mx = (START[0] + PEAK[0]) / 2;
  const mz = (START[1] + PEAK[1]) / 2;
  return [mx + 1.0, mz + 1.75];
}

export const PATH_SAMPLES = 128;

/** Path A — the solution: a gentle arc from the plateau to the peak. */
export function buildPathA(samples: number = PATH_SAMPLES): Vec2[] {
  return catmullRom([START, arcControl(), PEAK], samples);
}

/** Path T — the train of thought: straight through the error pit. */
export function buildThoughtPath(samples: number = PATH_SAMPLES): Vec2[] {
  return catmullRom([START, PIT, PEAK], samples);
}

/**
 * Path B — the student's train of thought. It equals path A at both ends and
 * diverges towards the pit in the middle, proportionally to `signal`. When the
 * pit fills in (signal → 0) path B straightens and merges with path A.
 */
export function buildPathB(
  signal: number,
  samples: number = PATH_SAMPLES,
): Vec2[] {
  const a = buildPathA(samples);
  const t = buildThoughtPath(samples);
  const count = Math.min(a.length, t.length);

  const out: Vec2[] = [];
  for (let i = 0; i < count; i += 1) {
    const s = i / Math.max(1, count - 1);
    const bump = Math.pow(Math.sin(Math.PI * s), 1.2);
    out.push([
      lerp(a[i][0], t[i][0], signal * bump),
      lerp(a[i][1], t[i][1], signal * bump),
    ]);
  }
  return out;
}
