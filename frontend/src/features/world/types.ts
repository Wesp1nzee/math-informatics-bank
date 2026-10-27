export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];

/**
 * A named target state for the world. The renderer interpolates its current
 * values towards these targets with damping, so the camera "glides" between
 * sections instead of jumping.
 */
export type WorldState = {
  name: string;
  /** Camera eye position in world units. */
  cam: Vec3;
  /** Camera look-at target in world units. */
  look: Vec3;
  /** 0 → flat plane, 1 → full relief. Entrance animation. */
  morph: number;
  /** Overall relief amplitude scale. */
  relief: number;
  /** Number of contour levels across the height range. */
  levels: number;
  /** Fog density (0..1). */
  fog: number;
  /** Error-pit intensity (0..1); also drives path B divergence. */
  signal: number;
  /** Marker / line glow brightness (0..1). */
  glow: number;
  /** Draw progress of path A (solution), 0..1. */
  drawA: number;
  /** Draw progress of path B (train of thought), 0..1. */
  drawB: number;
  /** Position of the "you are here" marker on the xz-plane. */
  marker: Vec2;
  /** Morph target for the 3D abstraction: 0 torus, 1 wave, 2 lattice, 3 sphere, 4 ring. */
  shape: number;
};

export type PulseKind = "ok" | "err";

export type WorldPalette = {
  /** Deep background of the scene. */
  bg: [number, number, number];
  /** Main isoline colour. */
  line: [number, number, number];
  /** Thicker "every 5th" isoline colour. */
  lineMajor: [number, number, number];
  /** Accent glow colour. */
  accent: [number, number, number];
  /** Peak / summit colour. */
  peak: [number, number, number];
  /** Error-pit / signal colour (coral). */
  signal: [number, number, number];
  /** Fog colour. */
  fog: [number, number, number];
};

export type WorldStats = {
  avgFrameMs: number;
  dpr: number;
  degradations: number;
  frames: number;
  stopped: boolean;
};
