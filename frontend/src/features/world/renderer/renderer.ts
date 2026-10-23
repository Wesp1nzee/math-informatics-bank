import {
  buildPathA,
  buildPathB,
  heightAt,
  LANDSCAPE,
  PATH_LIFT,
  PIT,
  WORLD_SIZE,
  type LandscapeParams,
} from "@/features/world/landscape";
import type { PulseKind, Vec2, WorldPalette, WorldState } from "@/features/world/types";
import { getWorldState } from "@/features/world/world-states";
import {
  mat4Identity,
  mat4LookAt,
  mat4Multiply,
  mat4Perspective,
  type Mat4,
} from "@/features/world/renderer/mat4";
import { compileProgram } from "@/features/world/renderer/program";

const HALF = WORLD_SIZE / 2;
const HEIGHT_RANGE = 4.2;
const FOVY = (55 * Math.PI) / 180;
const UP = [0, 1, 0] as const;

type Ripple = {
  x: number;
  z: number;
  start: number;
  dur: number;
  maxRadius: number;
  color: [number, number, number];
};

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------

const TERRAIN_VERT = `#version 300 es
precision highp float;

layout(location=0) in vec2 aPos;

uniform vec2 uPeakC; uniform float uPeakA; uniform float uPeakS;
uniform vec2 uPlateauC; uniform float uPlateauA; uniform float uPlateauS;
uniform vec2 uRidgeC; uniform float uRidgeA; uniform float uRidgeS;
uniform vec2 uPitC; uniform float uPitA; uniform float uPitS;
uniform float uMorph;
uniform float uRelief;
uniform float uSignalAmt;
uniform float uNoiseAmp;
uniform mat4 uViewProj;

out vec3 vWorld;
out float vHeight;
out vec3 vNormal;

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise2(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y) * 2.0 - 1.0;
}

float gauss(vec2 p, vec2 c, float s){
  vec2 d = p - c;
  return exp(-dot(d, d) / (2.0 * s * s));
}

void main(){
  vec2 p = aPos;
  float gPeak = gauss(p, uPeakC, uPeakS);
  float gPlat = gauss(p, uPlateauC, uPlateauS);
  float gRidge = gauss(p, uRidgeC, uRidgeS);
  float gPit = gauss(p, uPitC, uPitS);

  float h = uPeakA * gPeak + uPlateauA * gPlat + uRidgeA * gRidge + uPitA * uSignalAmt * gPit;
  h += uNoiseAmp * noise2(p * 2.6);
  h *= uRelief * uMorph;

  vec2 grad = vec2(0.0);
  grad += uPeakA * gPeak * (-(p - uPeakC) / (uPeakS * uPeakS));
  grad += uPlateauA * gPlat * (-(p - uPlateauC) / (uPlateauS * uPlateauS));
  grad += uRidgeA * gRidge * (-(p - uRidgeC) / (uRidgeS * uRidgeS));
  grad += uPitA * uSignalAmt * gPit * (-(p - uPitC) / (uPitS * uPitS));
  grad *= uRelief * uMorph;

  vec3 world = vec3(p.x, h, p.y);
  vWorld = world;
  vHeight = h;
  vNormal = normalize(vec3(-grad.x, 1.0, -grad.y));

  gl_Position = uViewProj * vec4(world, 1.0);
}
`;

const TERRAIN_FRAG = `#version 300 es
precision highp float;

in vec3 vWorld;
in float vHeight;
in vec3 vNormal;

out vec4 outColor;

uniform float uLevels;
uniform vec3 uBg;
uniform vec3 uLine;
uniform vec3 uLineMajor;
uniform vec3 uPeak;
uniform vec3 uSignalColor;
uniform vec3 uFog;
uniform float uFogAmount;
uniform float uSignalAmt;
uniform float uScan;
uniform vec3 uCamPos;
uniform float uHalf;
uniform vec3 uAccent;

float hash12(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main(){
  float h = vHeight;
  float f = h * uLevels / ${HEIGHT_RANGE.toFixed(2)};
  float density = abs(fract(f - 0.5) - 0.5) / fwidth(f);
  float lineMask = 1.0 - smoothstep(0.0, 1.0, density);

  float f5 = f / 5.0;
  float density5 = abs(fract(f5 - 0.5) - 0.5) / fwidth(f5);
  float majorMask = 1.0 - smoothstep(0.0, 1.6, density5);

  // Height tint: higher ground pulls toward the peak colour.
  float tint = smoothstep(0.0, ${HEIGHT_RANGE.toFixed(2)}, h);

  // Error pit highlight (coral), proportional to signal.
  float dPit = distance(vWorld.xz, vec2(${PIT[0].toFixed(2)}, ${PIT[1].toFixed(2)}));
  float pitMask = exp(-dPit * dPit / (2.0 * ${(LANDSCAPE.pitSigma * 1.5).toFixed(2)} * ${(LANDSCAPE.pitSigma * 1.5).toFixed(2)}));

  vec3 lineCol = mix(uLine, uLineMajor, majorMask);
  lineCol = mix(lineCol, uPeak, tint * 0.85);
  lineCol = mix(lineCol, uSignalColor, pitMask * uSignalAmt);

  vec3 col = mix(uBg, lineCol, clamp(lineMask, 0.0, 1.0));

  // Fresnel on glancing angles.
  vec3 viewDir = normalize(uCamPos - vWorld);
  float fresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 2.2);
  col += uAccent * fresnel * 0.16;

  // Scan sweep highlight.
  if (uScan > -900.0) {
    float band = 1.0 - smoothstep(0.0, 3.2, abs(vWorld.x - uScan));
    col += uAccent * band * (0.25 + lineMask * 0.6);
  }

  // Fog by distance.
  float fogFactor = 1.0 - exp(-uFogAmount * length(vWorld - uCamPos));
  fogFactor = clamp(fogFactor, 0.0, 1.0);
  col = mix(col, uFog, fogFactor);

  // Fade edges so the mesh never shows a hard border.
  float edge = 1.0 - smoothstep(uHalf * 0.5, uHalf, length(vWorld.xz));
  float alpha = edge;

  // Subtle grain.
  float grain = hash12(gl_FragCoord.xy + fract(uLevels) * 13.0) - 0.5;
  col += grain * 0.02;

  outColor = vec4(col, alpha);
}
`;

const RIBBON_VERT = `#version 300 es
precision highp float;

layout(location=0) in vec3 aPos;
layout(location=1) in float aT;
layout(location=2) in float aSide;

uniform mat4 uViewProj;

out float vT;
out float vSide;

void main(){
  vT = aT;
  vSide = aSide;
  gl_Position = uViewProj * vec4(aPos, 1.0);
}
`;

const RIBBON_FRAG = `#version 300 es
precision highp float;

in float vT;
in float vSide;

out vec4 outColor;

uniform vec3 uColor;
uniform float uDraw;
uniform float uOpacity;

void main(){
  float edge = 1.0 - smoothstep(0.35, 1.0, abs(vSide));
  // Fade out past the draw head.
  float drawMask = smoothstep(uDraw + 0.015, uDraw - 0.03, vT);
  // Bright core at the head.
  float head = smoothstep(uDraw, uDraw - 0.045, vT);
  float a = edge * drawMask * uOpacity;
  vec3 col = uColor + uColor * head * 1.6;
  outColor = vec4(col, a);
}
`;

const GROUND_VERT = `#version 300 es
precision highp float;

layout(location=0) in vec2 aCorner;

uniform vec3 uCenter;
uniform vec2 uSize;
uniform mat4 uViewProj;

out vec2 vUv;

void main(){
  vUv = aCorner * 0.5 + 0.5;
  vec3 p = vec3(uCenter.x + aCorner.x * uSize.x * 0.5, uCenter.y, uCenter.z + aCorner.y * uSize.y * 0.5);
  gl_Position = uViewProj * vec4(p, 1.0);
}
`;

const GROUND_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;

out vec4 outColor;

uniform vec3 uColor;
uniform float uInner;
uniform float uOuter;
uniform float uSoft;
uniform float uOpacity;

void main(){
  vec2 d = vUv * 2.0 - 1.0;
  float r = length(d);
  float ring = smoothstep(uOuter, uOuter - uSoft, r) * smoothstep(uInner - uSoft, uInner, r);
  outColor = vec4(uColor, ring * uOpacity);
}
`;

const BILLBOARD_VERT = `#version 300 es
precision highp float;

layout(location=0) in vec2 aCorner;

uniform vec3 uCenter;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec2 uSize;
uniform mat4 uViewProj;

out vec2 vUv;

void main(){
  vUv = aCorner * 0.5 + 0.5;
  vec3 p = uCenter + uRight * (aCorner.x * uSize.x * 0.5) + uUp * (aCorner.y * uSize.y * 0.5);
  gl_Position = uViewProj * vec4(p, 1.0);
}
`;

const BILLBOARD_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;

out vec4 outColor;

uniform vec3 uColor;
uniform float uOpacity;
uniform float uFalloff;

void main(){
  // Radial soft glow, peak at centre.
  vec2 d = vUv * 2.0 - 1.0;
  float r = length(d);
  float glow = exp(-r * r * uFalloff);
  outColor = vec4(uColor, glow * uOpacity);
}
`;

const MORPH_VERT = `#version 300 es
precision highp float;

layout(location=0) in vec4 aSeed;
layout(location=1) in vec3 aGrid;

uniform mat4 uViewProj;
uniform float uTime;
uniform float uShape;
uniform float uScroll;
uniform vec2 uPointer;
uniform vec3 uAccent;
uniform vec3 uPeak;
uniform vec3 uSignalColor;
uniform float uGlow;
uniform float uSignalAmt;
uniform float uPixelRatio;
uniform float uPulse;

out vec3 vColor;
out float vAlpha;

void main(){
  float t = uTime;
  float u = aSeed.x;
  float v = aSeed.y;
  float rnd = aSeed.z;
  vec3 g = aGrid;

  float a = u * 6.2831853;
  float b = v * 6.2831853;

  float wobble = 1.0 + 0.08 * sin(t * 1.1 + a * 3.0);
  vec3 pTorus = vec3(
    (2.55 + 0.95 * cos(b)) * cos(a) * wobble,
    (2.55 + 0.95 * cos(b)) * sin(a) * wobble,
    0.95 * sin(b) * (1.0 + 0.12 * sin(t * 0.9 + a * 2.0))
  );

  float wx = g.x * 5.2;
  float wz = g.z * 5.2;
  vec3 pWave = vec3(
    wx,
    sin(wx * 1.5 + t * 0.35) * cos(wz * 1.5) * 1.45,
    wz
  );

  vec3 q = floor((g * 0.5 + 0.5) * 5.0 + 0.5) / 5.0 * 2.0 - 1.0;
  vec3 pLattice = vec3(q.x * 3.6, q.y * 3.0, q.z * 3.6);
  float latticePulse = pow(max(0.0, sin(t * 1.7 + (q.x + q.y + q.z) * 2.6)), 8.0);
  pLattice += normalize(q + vec3(0.001)) * latticePulse * 0.42;

  vec3 n = normalize(g + vec3(0.001, 0.002, 0.003));
  vec3 pSphere = n * (3.0 + 0.16 * sin(t * 1.2 + n.y * 5.0));

  float ringRadius = 4.1 + 0.42 * sin(b * 2.0 + t * 1.2);
  vec3 pRing = vec3(
    cos(a) * ringRadius,
    sin(a) * ringRadius * 0.74,
    sin(b * 2.0 + t) * 0.55
  );

  vec3 p = pTorus;
  p = mix(p, pWave, clamp(uShape, 0.0, 1.0));
  p = mix(p, pLattice, clamp(uShape - 1.0, 0.0, 1.0));
  p = mix(p, pSphere, clamp(uShape - 2.0, 0.0, 1.0));
  p = mix(p, pRing, clamp(uShape - 3.0, 0.0, 1.0));

  p.y += 1.45;

  float heroWeight = 1.0 - clamp(uShape, 0.0, 1.0);
  p.x += uPointer.x * heroWeight * (0.55 + rnd * 0.45);
  p.y -= uPointer.y * heroWeight * (0.25 + rnd * 0.2);

  float rot = t * 0.06 + uScroll * 1.35;
  float cs = cos(rot);
  float sn = sin(rot);
  p.xz = mat2(cs, -sn, sn, cs) * p.xz;
  p *= 1.0 + 0.025 * sin(t * 0.8);
  p *= 1.0 + uPulse * 0.06;

  gl_Position = uViewProj * vec4(p, 1.0);
  gl_PointSize = (2.0 + 2.6 * rnd) * uPixelRatio * (1.0 + uPulse * 1.2);

  vColor = mix(uAccent, uPeak, clamp(g.y * 0.5 + 0.5, 0.0, 1.0));
  vColor = mix(vColor, uSignalColor, uSignalAmt * 0.55);
  float band = step(0.86, fract(rnd * 9.0 + uPulse * 3.0));
  vColor += band * 0.28;
  vAlpha = mix(0.34, 0.92, rnd) * uGlow;
}
`;

const MORPH_FRAG = `#version 300 es
precision highp float;

in vec3 vColor;
in float vAlpha;

out vec4 outColor;

uniform float uLine;

void main(){
  if (uLine > 0.5) {
    outColor = vec4(vColor, vAlpha * 0.22);
    return;
  }
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float r = length(c);
  if (r > 1.0) discard;
  float glow = pow(1.0 - r, 1.7);
  outColor = vec4(vColor, glow * vAlpha);
}
`;

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

type TerrainMesh = { vao: WebGLVertexArrayObject; count: number };
type RibbonMesh = { vao: WebGLVertexArrayObject; vbo: WebGLBuffer; count: number };
type QuadMesh = { vao: WebGLVertexArrayObject };
type MorphMesh = {
  pointVao: WebGLVertexArrayObject;
  pointCount: number;
  lineVao: WebGLVertexArrayObject;
  lineCount: number;
};

function createMorphMesh(gl: WebGL2RenderingContext, n: number): MorphMesh {
  const pointData: number[] = [];
  const coords: [number, number, number][] = [];
  for (let k = 0; k < n; k += 1) {
    for (let j = 0; j < n; j += 1) {
      for (let i = 0; i < n; i += 1) {
        const gx = (i / (n - 1)) * 2 - 1;
        const gy = (k / (n - 1)) * 2 - 1;
        const gz = (j / (n - 1)) * 2 - 1;
        const seed =
          Math.abs(
            Math.sin((i + 1) * 12.9898 + (j + 1) * 78.233 + (k + 1) * 37.719) *
              43758.5453,
          ) % 1;
        pointData.push(i / (n - 1), j / (n - 1), seed, (i + j + k) % 3);
        pointData.push(gx, gy, gz);
        coords.push([i, j, k]);
      }
    }
  }

  const lineData: number[] = [];
  const pushVertex = (i: number, j: number, k: number) => {
    const gx = (i / (n - 1)) * 2 - 1;
    const gy = (k / (n - 1)) * 2 - 1;
    const gz = (j / (n - 1)) * 2 - 1;
    const seed =
      Math.abs(
        Math.sin((i + 1) * 12.9898 + (j + 1) * 78.233 + (k + 1) * 37.719) * 43758.5453,
      ) % 1;
    lineData.push(i / (n - 1), j / (n - 1), seed, (i + j + k) % 3);
    lineData.push(gx, gy, gz);
  };
  for (const [i, j, k] of coords) {
    if (i < n - 1) {
      pushVertex(i, j, k);
      pushVertex(i + 1, j, k);
    }
    if (j < n - 1) {
      pushVertex(i, j, k);
      pushVertex(i, j + 1, k);
    }
    if (k < n - 1) {
      pushVertex(i, j, k);
      pushVertex(i, j, k + 1);
    }
  }

  const buildVao = (data: number[]): WebGLVertexArrayObject => {
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    const stride = 7 * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 4 * 4);
    gl.bindVertexArray(null);
    return vao;
  };

  const pointVao = buildVao(pointData);
  const lineVao = buildVao(lineData);
  return {
    pointVao,
    pointCount: pointData.length / 7,
    lineVao,
    lineCount: lineData.length / 7,
  };
}

function createTerrain(gl: WebGL2RenderingContext, n: number): TerrainMesh {
  const step = WORLD_SIZE / n;
  const verts = n + 1;
  const positions = new Float32Array(verts * verts * 2);
  let i = 0;
  for (let iz = 0; iz <= n; iz += 1) {
    const z = -HALF + iz * step;
    for (let ix = 0; ix <= n; ix += 1) {
      positions[i++] = -HALF + ix * step;
      positions[i++] = z;
    }
  }

  const indices = new Uint32Array(n * n * 6);
  let k = 0;
  for (let iz = 0; iz < n; iz += 1) {
    for (let ix = 0; ix < n; ix += 1) {
      const a = iz * verts + ix;
      const b = a + 1;
      const c = a + verts;
      const d = c + 1;
      indices[k++] = a;
      indices[k++] = c;
      indices[k++] = b;
      indices[k++] = b;
      indices[k++] = c;
      indices[k++] = d;
    }
  }

  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  const vbo = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const ibo = gl.createBuffer()!;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  return { vao, count: indices.length };
}

function createQuad(gl: WebGL2RenderingContext): QuadMesh {
  // Two triangles covering [-1,1]^2.
  const corners = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  const vbo = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  return { vao };
}

export class WorldRenderer {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;

  private proj: Mat4 = mat4Identity();
  private view: Mat4 = mat4Identity();
  private viewProj: Mat4 = mat4Identity();

  private terrainProgram: ReturnType<typeof compileProgram>;
  private terrain: TerrainMesh;
  private ribbonProgram: ReturnType<typeof compileProgram>;
  private ribbonA: RibbonMesh;
  private ribbonB: RibbonMesh;
  private groundProgram: ReturnType<typeof compileProgram>;
  private billboardProgram: ReturnType<typeof compileProgram>;
  private morphProgram: ReturnType<typeof compileProgram>;
  private quad: QuadMesh;
  private morph: MorphMesh;

  private current: WorldState;
  private target: WorldState;
  private hasState = false;

  private palette: WorldPalette;
  private dark: boolean;

  private ripples: Ripple[] = [];
  private pulseWave = -1;
  private signalSpike = 0;
  private scanT = -1;
  private lastPointerRipple = 0;
  private pointer = { x: 0, y: 0, active: false };
  private time = 0;
  private lastT = 0;
  private scrollProgress = 0;

  private dpr = 1;
  private width = 0;
  private height = 0;

  private frameSamples: number[] = [];
  private degradations = 0;
  private frames = 0;
  private stopped = false;
  private raf = 0;
  private running = false;
  private disposed = false;
  private idle = false;
  private lastActivity = 0;

  private ribbonAWorld: { x: number; y: number; z: number }[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    palette: WorldPalette,
    dark: boolean,
    dpr: number,
    preserveDrawingBuffer = false,
  ) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl2", {
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      depth: true,
      preserveDrawingBuffer,
    });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    this.palette = palette;
    this.dark = dark;
    this.dpr = dpr;

    this.terrainProgram = compileProgram(gl, TERRAIN_VERT, TERRAIN_FRAG);
    this.ribbonProgram = compileProgram(gl, RIBBON_VERT, RIBBON_FRAG);
    this.groundProgram = compileProgram(gl, GROUND_VERT, GROUND_FRAG);
    this.billboardProgram = compileProgram(gl, BILLBOARD_VERT, BILLBOARD_FRAG);
    this.morphProgram = compileProgram(gl, MORPH_VERT, MORPH_FRAG);

    const detail = this.deviceDetailLevel();
    this.terrain = createTerrain(gl, detail);
    this.quad = createQuad(gl);
    this.ribbonA = this.createRibbon();
    this.ribbonB = this.createRibbon();
    this.morph = createMorphMesh(gl, detail < 120 ? 8 : 10);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);

    const initial = getWorldState("hero") ?? this.defaultState();
    this.current = this.clone(initial);
    this.current.morph = 0; // entrance: flat plane rises into relief
    this.target = this.clone(initial);
  }

  private defaultState(): WorldState {
    return {
      name: "hero",
      cam: [0, 13, 16],
      look: [0, 0.4, 0],
      morph: 1,
      relief: 1,
      levels: 14,
      fog: 0.28,
      signal: 0,
      glow: 0.85,
      drawA: 0.9,
      drawB: 0.55,
      marker: [LANDSCAPE.plateauX, LANDSCAPE.plateauZ],
      shape: 0,
    };
  }

  private clone(s: WorldState): WorldState {
    return {
      ...s,
      cam: [...s.cam] as WorldState["cam"],
      look: [...s.look] as WorldState["look"],
      marker: [...s.marker] as WorldState["marker"],
    };
  }

  private deviceDetailLevel(): number {
    // Grid resolution: fewer cells on small / weak devices.
    const small = typeof window !== "undefined" && window.innerWidth < 768;
    return small ? 96 : 160;
  }

  private createRibbon(): RibbonMesh {
    const gl = this.gl;
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    const stride = 5 * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, stride, 3 * 4);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, 4 * 4);
    gl.bindVertexArray(null);
    return { vao, vbo, count: 0 };
  }

  setState(name: string): void {
    const state = getWorldState(name);
    if (!state) return;
    this.target = this.clone(state);
    if (!this.hasState) {
      this.current = this.clone(state);
      this.hasState = true;
    }
  }

  pulse(kind: PulseKind): void {
    if (kind === "ok") {
      this.pulseWave = 0;
      this.signalSpike = Math.max(this.signalSpike, -0.2);
    } else {
      this.signalSpike = 1;
      this.spawnRipple(PIT[0], PIT[1], 2.6, this.palette.signal, 1.1);
    }
    this.wake();
  }

  scan(): void {
    this.scanT = 0;
    this.wake();
  }

  setPointer(nx: number, ny: number): void {
    this.pointer.x = nx;
    this.pointer.y = ny;
    this.pointer.active = true;
    this.wake();

    const now = performance.now();
    if (now - this.lastPointerRipple > 160) {
      this.lastPointerRipple = now;
      const hit = this.rayToGround(nx, ny);
      if (hit && this.ripples.length < 3) {
        this.spawnRipple(hit[0], hit[1], 1.4, this.palette.accent, 0.9);
      }
    }
  }

  setPalette(palette: WorldPalette, dark: boolean): void {
    this.palette = palette;
    this.dark = dark;
  }

  setScroll(progress: number): void {
    this.scrollProgress = Math.min(1, Math.max(0, progress));
  }

  setDpr(dpr: number): void {
    this.dpr = dpr;
    this.resize(this.width, this.height);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    const gl = this.gl;
    const dpr = Math.min(this.dpr, 1.5);
    const w = Math.max(1, Math.floor(width * dpr));
    const h = Math.max(1, Math.floor(height * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    mat4Perspective(this.proj, FOVY, w / h, 0.1, 200);
  }

  private wake(): void {
    this.lastActivity = performance.now();
    this.idle = false;
  }

  private spawnRipple(
    x: number,
    z: number,
    maxRadius: number,
    color: [number, number, number],
    dur: number,
  ): void {
    this.ripples.push({ x, z, start: this.time, dur, maxRadius, color });
    if (this.ripples.length > 3) this.ripples.shift();
  }

  private rayToGround(nx: number, ny: number): [number, number] | null {
    // Unproject the pointer ray and intersect the y=0 plane via a forward ray
    // from the eye through the near plane.
    const eye = this.current.cam;
    const look = this.current.look;
    const forward = [look[0] - eye[0], look[1] - eye[1], look[2] - eye[2]] as const;
    const fl = Math.hypot(...forward) || 1;
    const f = [forward[0] / fl, forward[1] / fl, forward[2] / fl];
    const right = [f[2], 0, -f[0]] as const;
    const rl = Math.hypot(right[0], right[2]) || 1;
    const r = [right[0] / rl, 0, right[2] / rl];
    const up = [
      r[1] * f[2] - r[2] * f[1],
      r[2] * f[0] - r[0] * f[2],
      r[0] * f[1] - r[1] * f[0],
    ] as const;
    const tan = Math.tan(FOVY / 2);
    const aspect = this.width / Math.max(1, this.height);

    const dir = [
      f[0] + r[0] * nx * tan * aspect + up[0] * ny * tan,
      f[1] + r[1] * nx * tan * aspect + up[1] * ny * tan,
      f[2] + r[2] * nx * tan * aspect + up[2] * ny * tan,
    ];
    if (Math.abs(dir[1]) < 1e-5) return null;
    const t = -eye[1] / dir[1];
    if (t < 0) return null;
    const x = eye[0] + dir[0] * t;
    const z = eye[2] + dir[2] * t;
    if (Math.abs(x) > HALF || Math.abs(z) > HALF) return null;
    return [x, z];
  }

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.lastT = performance.now();
    this.lastActivity = this.lastT;
    const loop = (now: number) => {
      if (!this.running || this.disposed) return;
      const dt = Math.min((now - this.lastT) / 1000, 0.1);
      this.lastT = now;
      this.time += dt;

      const idleNow = performance.now();
      if (idleNow - this.lastActivity > 4000) {
        this.idle = true;
        this.running = false;
        this.stopped = true;
        return;
      }

      const start = performance.now();
      this.update(dt);
      this.render();
      const ms = performance.now() - start;
      this.frames += 1;
      this.frameSamples.push(ms);
      if (this.frameSamples.length > 60) this.frameSamples.shift();

      this.adaptQuality();

      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    this.stopped = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /** Resume the loop after idle throttling; safe to call on every scroll/move. */
  resume(): void {
    this.wake();
    if (!this.running && !this.disposed) this.start();
  }

  renderStaticFrame(): void {
    this.current = this.clone(this.target);
    this.render();
  }

  private adaptQuality(): void {
    if (this.frameSamples.length < 30) return;
    const avg = this.frameSamples.reduce((a, b) => a + b, 0) / this.frameSamples.length;
    if (avg <= 22) return;
    this.frameSamples.length = 0;
    if (this.dpr > 0.75) {
      const next = this.dpr <= 1 ? 0.75 : this.dpr - 0.25;
      this.degradations += 1;
      this.setDpr(Math.max(0.75, next));
    } else {
      this.degradations += 1;
      this.stop();
    }
  }

  get stats(): {
    avgFrameMs: number;
    dpr: number;
    degradations: number;
    frames: number;
    stopped: boolean;
  } {
    const avg =
      this.frameSamples.length > 0
        ? this.frameSamples.reduce((a, b) => a + b, 0) / this.frameSamples.length
        : 0;
    return {
      avgFrameMs: avg,
      dpr: this.dpr,
      degradations: this.degradations,
      frames: this.frames,
      stopped: this.stopped,
    };
  }

  /** Debug pixel readback (requires preserveDrawingBuffer). */
  sample(): { center: number[]; edge: number[] } | null {
    const gl = this.gl;
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    if (w === 0 || h === 0) return null;
    const read = (x: number, y: number): number[] => {
      const px = new Uint8Array(4);
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      return [px[0], px[1], px[2], px[3]];
    };
    return { center: read(w >> 1, h >> 1), edge: read(4, h >> 1) };
  }

  // --- animation update ----------------------------------------------------

  private update(dt: number): void {
    const c = this.current;
    const t = this.target;
    const k = 1 - Math.exp(-dt * 3.4); // smooth damping

    c.cam = this.lerp3(c.cam, t.cam, k);
    c.look = this.lerp3(c.look, t.look, k);
    c.morph = this.lerp1(c.morph, t.morph, k);
    c.relief = this.lerp1(c.relief, t.relief, k);
    c.levels = this.lerp1(c.levels, t.levels, k);
    c.fog = this.lerp1(c.fog, t.fog, k);
    c.glow = this.lerp1(c.glow, t.glow, k);
    c.drawA = this.lerp1(c.drawA, t.drawA, k);
    c.drawB = this.lerp1(c.drawB, t.drawB, k);
    c.shape = this.lerp1(c.shape, t.shape, k);
    c.marker = this.lerp2(c.marker, t.marker, k);

    // signal combines the target and transient spikes.
    const spike = this.signalSpike > 0 ? this.signalSpike : 0;
    this.signalSpike = Math.max(0, this.signalSpike - dt / 0.9);
    c.signal = this.lerp1(c.signal, Math.max(0, Math.min(1, t.signal + spike)), k);

    // transient animations.
    if (this.pulseWave >= 0) {
      this.pulseWave += dt / 1.3;
      if (this.pulseWave >= 1) this.pulseWave = -1;
    }
    if (this.scanT >= 0) {
      this.scanT += dt / 1.4;
      if (this.scanT >= 1) this.scanT = -1;
    }
    for (let i = this.ripples.length - 1; i >= 0; i -= 1) {
      if (this.time - this.ripples[i].start > this.ripples[i].dur)
        this.ripples.splice(i, 1);
    }
  }

  private lerp1(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
  private lerp2(a: Vec2, b: Vec2, t: number): Vec2 {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  private lerp3(
    a: WorldState["cam"],
    b: WorldState["cam"],
    t: number,
  ): WorldState["cam"] {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ];
  }

  // --- geometry rebuild ----------------------------------------------------

  private landscapeParams(signal: number): LandscapeParams {
    return {
      ...LANDSCAPE,
      relief: this.current.relief,
      morph: this.current.morph,
      signal,
    };
  }

  private buildRibbonBuffer(
    path: Vec2[],
    halfWidth: number,
  ): { data: Float32Array; count: number } {
    const params = this.landscapeParams(this.current.signal);
    const n = path.length;
    const data = new Float32Array(n * 2 * 5);
    let idx = 0;

    for (let i = 0; i < n; i += 1) {
      const p = path[i];
      // Tangent via neighbours.
      const prev = path[Math.max(0, i - 1)];
      const next = path[Math.min(n - 1, i + 1)];
      let dx = next[0] - prev[0];
      let dz = next[1] - prev[1];
      const len = Math.hypot(dx, dz) || 1;
      dx /= len;
      dz /= len;
      // Perpendicular in xz-plane.
      const px = -dz;
      const pz = dx;

      const y = heightAt(p[0], p[1], params) + PATH_LIFT;
      const t = n === 1 ? 0 : i / (n - 1);

      // left vertex
      data[idx++] = p[0] - px * halfWidth;
      data[idx++] = y;
      data[idx++] = p[1] - pz * halfWidth;
      data[idx++] = t;
      data[idx++] = -1;
      // right vertex
      data[idx++] = p[0] + px * halfWidth;
      data[idx++] = y;
      data[idx++] = p[1] + pz * halfWidth;
      data[idx++] = t;
      data[idx++] = 1;
    }
    return { data, count: n * 2 };
  }

  private uploadRibbon(mesh: RibbonMesh, data: Float32Array, count: number): void {
    const gl = this.gl;
    gl.bindVertexArray(mesh.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    mesh.count = count;
    gl.bindVertexArray(null);
  }

  // --- render --------------------------------------------------------------

  private render(): void {
    const gl = this.gl;
    const c = this.current;

    // Pointer parallax on the eye.
    const px = this.pointer.active ? this.pointer.x * 0.4 : 0;
    const pz = this.pointer.active ? this.pointer.y * 0.4 : 0;
    const eye: [number, number, number] = [c.cam[0] + px, c.cam[1], c.cam[2] + pz];

    mat4LookAt(this.view, eye, c.look, UP);
    mat4Multiply(this.viewProj, this.proj, this.view);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Terrain uses normal alpha blending so its faded edges sit over the fallback.
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Distance to scene centre for width scaling.
    const dist = Math.hypot(eye[0], eye[1], eye[2]) || 1;
    const pxToWorld = (pxw: number) =>
      (pxw / Math.max(1, this.height)) * dist * Math.tan(FOVY / 2) * 2;

    this.renderTerrain(eye);
    this.renderMorph();
    this.renderRibbons(pxToWorld);
    this.renderMarker();
    this.renderRipples();
    this.renderPulse(pxToWorld);
    this.renderPillar();
  }

  private renderMorph(): void {
    const gl = this.gl;
    const c = this.current;
    const u = this.morphProgram.uniforms;
    gl.useProgram(this.morphProgram.program);
    gl.uniformMatrix4fv(u.get("uViewProj")!, false, this.viewProj);
    gl.uniform1f(u.get("uTime")!, this.time);
    gl.uniform1f(u.get("uShape")!, c.shape);
    gl.uniform1f(u.get("uScroll")!, this.scrollProgress);
    gl.uniform2f(
      u.get("uPointer")!,
      this.pointer.active ? this.pointer.x : 0,
      this.pointer.active ? -this.pointer.y : 0,
    );
    gl.uniform3fv(u.get("uAccent")!, this.palette.accent);
    gl.uniform3fv(u.get("uPeak")!, this.palette.peak);
    gl.uniform3fv(u.get("uSignalColor")!, this.palette.signal);
    gl.uniform1f(u.get("uGlow")!, c.glow);
    gl.uniform1f(u.get("uSignalAmt")!, c.signal);
    gl.uniform1f(u.get("uPixelRatio")!, Math.min(this.dpr, 1.5));
    gl.uniform1f(
      u.get("uPulse")!,
      this.pulseWave >= 0 ? Math.sin(Math.PI * this.pulseWave) : 0,
    );

    gl.depthMask(false);
    this.glowBlend();
    gl.uniform1f(u.get("uLine")!, 1);
    gl.bindVertexArray(this.morph.lineVao);
    gl.drawArrays(gl.LINES, 0, this.morph.lineCount);
    gl.uniform1f(u.get("uLine")!, 0);
    gl.bindVertexArray(this.morph.pointVao);
    gl.drawArrays(gl.POINTS, 0, this.morph.pointCount);
    gl.bindVertexArray(null);
    gl.depthMask(true);
  }

  private setTerrainUniforms(eye: [number, number, number]): void {
    const gl = this.gl;
    const p = this.terrainProgram;
    gl.useProgram(p.program);
    const u = p.uniforms;
    gl.uniformMatrix4fv(u.get("uViewProj")!, false, this.viewProj);
    gl.uniform2f(u.get("uPeakC")!, LANDSCAPE.peakX, LANDSCAPE.peakZ);
    gl.uniform1f(u.get("uPeakA")!, LANDSCAPE.peakAmp);
    gl.uniform1f(u.get("uPeakS")!, LANDSCAPE.peakSigma);
    gl.uniform2f(u.get("uPlateauC")!, LANDSCAPE.plateauX, LANDSCAPE.plateauZ);
    gl.uniform1f(u.get("uPlateauA")!, LANDSCAPE.plateauAmp);
    gl.uniform1f(u.get("uPlateauS")!, LANDSCAPE.plateauSigma);
    gl.uniform2f(u.get("uRidgeC")!, LANDSCAPE.ridgeX, LANDSCAPE.ridgeZ);
    gl.uniform1f(u.get("uRidgeA")!, LANDSCAPE.ridgeAmp);
    gl.uniform1f(u.get("uRidgeS")!, LANDSCAPE.ridgeSigma);
    gl.uniform2f(u.get("uPitC")!, LANDSCAPE.pitX, LANDSCAPE.pitZ);
    gl.uniform1f(u.get("uPitA")!, LANDSCAPE.pitAmp);
    gl.uniform1f(u.get("uPitS")!, LANDSCAPE.pitSigma);
    gl.uniform1f(u.get("uMorph")!, this.current.morph);
    gl.uniform1f(u.get("uRelief")!, this.current.relief);
    gl.uniform1f(u.get("uSignalAmt")!, this.current.signal);
    gl.uniform1f(u.get("uNoiseAmp")!, 0.06);
    gl.uniform1f(u.get("uLevels")!, this.current.levels);
    gl.uniform3fv(u.get("uBg")!, this.palette.bg);
    gl.uniform3fv(u.get("uLine")!, this.palette.line);
    gl.uniform3fv(u.get("uLineMajor")!, this.palette.lineMajor);
    gl.uniform3fv(u.get("uPeak")!, this.palette.peak);
    gl.uniform3fv(u.get("uSignalColor")!, this.palette.signal);
    gl.uniform3fv(u.get("uFog")!, this.palette.fog);
    gl.uniform1f(u.get("uFogAmount")!, this.current.fog * 0.12);
    gl.uniform1f(u.get("uSignalAmt")!, this.current.signal);
    gl.uniform1f(
      u.get("uScan")!,
      this.scanT >= 0 ? this.scanT * WORLD_SIZE - HALF : -999,
    );
    gl.uniform3fv(u.get("uCamPos")!, eye);
    gl.uniform1f(u.get("uHalf")!, HALF);
    gl.uniform3fv(u.get("uAccent")!, this.palette.accent);
  }

  private renderTerrain(eye: [number, number, number]): void {
    const gl = this.gl;
    this.setTerrainUniforms(eye);
    gl.bindVertexArray(this.terrain.vao);
    gl.drawElements(gl.TRIANGLES, this.terrain.count, gl.UNSIGNED_INT, 0);
    gl.bindVertexArray(null);
  }

  private renderRibbons(pxToWorld: (px: number) => number): void {
    const gl = this.gl;
    const c = this.current;

    const widthA = pxToWorld(2.4) / 2;
    const widthB = pxToWorld(2.8) / 2;

    const pathA = buildPathA();
    const pathB = buildPathB(c.signal);

    const bufA = this.buildRibbonBuffer(pathA, widthA);
    this.uploadRibbon(this.ribbonA, bufA.data, bufA.count);
    const bufB = this.buildRibbonBuffer(pathB, widthB);
    this.uploadRibbon(this.ribbonB, bufB.data, bufB.count);

    gl.useProgram(this.ribbonProgram.program);
    const u = this.ribbonProgram.uniforms;
    gl.uniformMatrix4fv(u.get("uViewProj")!, false, this.viewProj);

    gl.depthMask(false);
    this.glowBlend();

    // Path A (solution) — accent.
    gl.uniform3fv(
      u.get("uColor")!,
      this.dark ? this.palette.accent : this.mul(this.palette.accent, 0.9),
    );
    gl.uniform1f(u.get("uDraw")!, c.drawA);
    gl.uniform1f(u.get("uOpacity")!, 0.85 * c.glow);
    gl.bindVertexArray(this.ribbonA.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.ribbonA.count);

    // Path B (thought) — coral, only when signal is meaningful.
    if (c.signal > 0.02) {
      gl.uniform3fv(u.get("uColor")!, this.palette.signal);
      gl.uniform1f(u.get("uDraw")!, c.drawB);
      gl.uniform1f(u.get("uOpacity")!, 0.85 * Math.min(1, c.signal + 0.2) * c.glow);
      gl.bindVertexArray(this.ribbonB.vao);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.ribbonB.count);
    }

    gl.bindVertexArray(null);
    gl.depthMask(true);
  }

  private renderMarker(): void {
    const gl = this.gl;
    const c = this.current;
    const params = this.landscapeParams(c.signal);
    const y = heightAt(c.marker[0], c.marker[1], params) + 0.06;

    gl.useProgram(this.groundProgram.program);
    const u = this.groundProgram.uniforms;
    gl.uniformMatrix4fv(u.get("uViewProj")!, false, this.viewProj);
    gl.depthMask(false);
    this.glowBlend();

    // Ground ring.
    gl.uniform3f(u.get("uCenter")!, c.marker[0], y, c.marker[1]);
    gl.uniform2f(u.get("uSize")!, 1.5, 1.5);
    gl.uniform3fv(u.get("uColor")!, this.palette.accent);
    gl.uniform1f(u.get("uInner")!, 0.72);
    gl.uniform1f(u.get("uOuter")!, 1.0);
    gl.uniform1f(u.get("uSoft")!, 0.12);
    gl.uniform1f(u.get("uOpacity")!, 0.9 * c.glow);
    gl.bindVertexArray(this.quad.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindVertexArray(null);
    gl.depthMask(true);
  }

  private renderPillar(): void {
    const gl = this.gl;
    const c = this.current;
    const params = this.landscapeParams(c.signal);
    const y = heightAt(c.marker[0], c.marker[1], params) + 0.06;
    const worldHeight = 2.2;

    const forward = [c.look[0] - c.cam[0], c.look[1] - c.cam[1], c.look[2] - c.cam[2]];
    const fl = Math.hypot(...forward) || 1;
    const right = [forward[2] / fl, 0, -forward[0] / fl];

    gl.useProgram(this.billboardProgram.program);
    const u = this.billboardProgram.uniforms;
    gl.uniformMatrix4fv(u.get("uViewProj")!, false, this.viewProj);
    gl.depthMask(false);
    this.glowBlend();
    gl.uniform3f(u.get("uCenter")!, c.marker[0], y + worldHeight / 2, c.marker[1]);
    gl.uniform3f(u.get("uRight")!, right[0], 0, right[1]);
    gl.uniform3f(u.get("uUp")!, 0, 1, 0);
    gl.uniform2f(u.get("uSize")!, 0.24, worldHeight);
    gl.uniform3fv(u.get("uColor")!, this.palette.accent);
    gl.uniform1f(u.get("uOpacity")!, 0.35 * c.glow);
    gl.uniform1f(u.get("uFalloff")!, 1.6);
    gl.bindVertexArray(this.quad.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
    gl.depthMask(true);
  }

  private renderRipples(): void {
    if (this.ripples.length === 0) return;
    const gl = this.gl;
    gl.useProgram(this.groundProgram.program);
    const u = this.groundProgram.uniforms;
    gl.uniformMatrix4fv(u.get("uViewProj")!, false, this.viewProj);
    gl.depthMask(false);
    this.glowBlend();

    for (const ripple of this.ripples) {
      const t = (this.time - ripple.start) / ripple.dur;
      const ease = 1 - Math.pow(1 - t, 3);
      const radius = 0.2 + ease * ripple.maxRadius;
      const fade = 1 - t;
      const params = this.landscapeParams(this.current.signal);
      const ry = heightAt(ripple.x, ripple.z, params) + 0.05;
      gl.uniform3f(u.get("uCenter")!, ripple.x, ry, ripple.z);
      gl.uniform2f(u.get("uSize")!, radius * 2, radius * 2);
      gl.uniform3fv(u.get("uColor")!, ripple.color);
      gl.uniform1f(u.get("uInner")!, 0.6 - 0.3 * fade);
      gl.uniform1f(u.get("uOuter")!, 1.0);
      gl.uniform1f(u.get("uSoft")!, 0.25);
      gl.uniform1f(u.get("uOpacity")!, 0.6 * fade);
      gl.bindVertexArray(this.quad.vao);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    gl.bindVertexArray(null);
    gl.depthMask(true);
  }

  private renderPulse(pxToWorld: (px: number) => number): void {
    if (this.pulseWave < 0) return;
    const gl = this.gl;
    const path = buildPathA();
    const s = this.pulseWave;
    const idx = Math.floor(s * (path.length - 1));
    const point = path[Math.min(path.length - 1, idx)];
    const params = this.landscapeParams(this.current.signal);
    const y = heightAt(point[0], point[1], params) + 0.1;
    const size = pxToWorld(26);

    const forward = [
      this.current.look[0] - this.current.cam[0],
      this.current.look[1] - this.current.cam[1],
      this.current.look[2] - this.current.cam[2],
    ];
    const fl = Math.hypot(...forward) || 1;
    const right = [forward[2] / fl, 0, -forward[0] / fl];

    gl.useProgram(this.billboardProgram.program);
    const u = this.billboardProgram.uniforms;
    gl.uniformMatrix4fv(u.get("uViewProj")!, false, this.viewProj);
    gl.depthMask(false);
    this.glowBlend();
    gl.uniform3f(u.get("uCenter")!, point[0], y, point[1]);
    gl.uniform3f(u.get("uRight")!, right[0], 0, right[1]);
    gl.uniform3f(u.get("uUp")!, 0, 1, 0);
    gl.uniform2f(u.get("uSize")!, size, size);
    gl.uniform3fv(u.get("uColor")!, this.palette.peak);
    gl.uniform1f(u.get("uOpacity")!, 0.9);
    gl.uniform1f(u.get("uFalloff")!, 2.2);
    gl.bindVertexArray(this.quad.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
    gl.depthMask(true);
  }

  private mul(c: [number, number, number], f: number): [number, number, number] {
    return [c[0] * f, c[1] * f, c[2] * f];
  }

  private glowBlend(): void {
    // Additive in dark mode (true glow); normal blending on light paper.
    this.gl.blendFunc(
      this.gl.SRC_ALPHA,
      this.dark ? this.gl.ONE : this.gl.ONE_MINUS_SRC_ALPHA,
    );
  }

  dispose(): void {
    this.disposed = true;
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    const gl = this.gl;
    gl.deleteVertexArray(this.terrain.vao);
    gl.deleteVertexArray(this.quad.vao);
    gl.deleteVertexArray(this.ribbonA.vao);
    gl.deleteVertexArray(this.ribbonB.vao);
    gl.deleteVertexArray(this.morph.pointVao);
    gl.deleteVertexArray(this.morph.lineVao);
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
