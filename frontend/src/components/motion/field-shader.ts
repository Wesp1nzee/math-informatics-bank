export type FieldVariant = "hero" | "quiet" | "dark" | "scan";

export type FieldPointer = { x: number; y: number };

export type FieldFrame = {
  time: number;
  pointer: FieldPointer;
  scroll: number;
};

export type FieldRenderer = {
  frame: (input: FieldFrame) => void;
  resize: (width: number, height: number, scale: number) => void;
  dispose: () => void;
};

type FieldColors = {
  background: [number, number, number];
  aurora1: [number, number, number];
  aurora2: [number, number, number];
  aurora3: [number, number, number];
  line: [number, number, number];
  glow: [number, number, number];
  signal: [number, number, number];
};

type FieldOptions = {
  variant: FieldVariant;
  colors: FieldColors;
};

const VERTEX_SHADER = `#version 300 es
precision highp float;
out vec2 v_uv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  v_uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_scroll;
uniform float u_variant;
uniform vec3 u_bg;
uniform vec3 u_aurora1;
uniform vec3 u_aurora2;
uniform vec3 u_aurora3;
uniform vec3 u_line;
uniform vec3 u_glow;
uniform vec3 u_signal;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 turn = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = turn * p * 2.03 + 17.1;
    amplitude *= 0.5;
  }
  return value;
}

float contour(float value, float count) {
  float scaled = value * count;
  float band = fract(scaled);
  float distanceToLine = min(band, 1.0 - band);
  float width = max(fwidth(scaled) * 1.15, 0.0015);
  return 1.0 - smoothstep(0.0, width, distanceToLine);
}

float majorContour(float value, float count) {
  float scaled = value * count * 0.2;
  float band = fract(scaled);
  float distanceToLine = min(band, 1.0 - band);
  float width = max(fwidth(scaled) * 1.7, 0.002);
  return 1.0 - smoothstep(0.0, width, distanceToLine);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / max(u_res.y, 1.0);

  float dark = 1.0 - step(0.5, abs(u_variant - 2.0));
  float scan = 1.0 - step(0.5, abs(u_variant - 3.0));
  float hero = 1.0 - step(0.5, abs(u_variant));
  float quiet = 1.0 - step(0.5, abs(u_variant - 1.0));

  float time = u_time * (quiet > 0.5 ? 0.035 : 0.07);

  // Domain warp: a slow, breathing terrain rather than a moving texture.
  vec2 drift = vec2(time * 0.55, -time * 0.35);
  vec2 q = p * 1.15 + drift;
  vec2 warp = vec2(
    fbm(q + vec2(0.0, 0.0)),
    fbm(q + vec2(5.2, 1.3))
  );
  vec2 wp = p * (hero > 0.5 ? 1.35 : 1.75) + (warp - 0.5) * (hero > 0.5 ? 1.55 : 1.1);
  wp.y += u_scroll * (hero > 0.5 ? 0.55 : 0.25);

  // Cursor is a soft gravity well: the field bends, it does not follow the mouse.
  vec2 pointer = (u_pointer - 0.5) * vec2(u_res.x / max(u_res.y, 1.0), 1.0) * 2.0;
  float pointerDistance = length(p - pointer);
  float well = exp(-pointerDistance * pointerDistance * 5.5) * (hero > 0.5 ? 0.26 : 0.12);
  wp += normalize(p - pointer + vec2(0.0001)) * well;

  float height = fbm(wp * 1.25 + vec2(time * 0.18, 0.0));
  float detail = fbm(wp * 2.6 - vec2(0.0, time * 0.12));
  height = mix(height, detail, 0.24);

  float lineCount = hero > 0.5 ? 15.0 : (scan > 0.5 ? 17.0 : 11.0);
  lineCount += u_scroll * (hero > 0.5 ? 6.0 : 1.5);

  float thin = contour(height, lineCount);
  float thick = majorContour(height, lineCount);

  // Scan mode: a luminous horizontal pass leaves denser contours behind it.
  float scanY = fract(u_time * 0.045);
  float scanDistance = abs(uv.y - (1.0 - scanY));
  float scanLine = exp(-scanDistance * scanDistance * 2200.0) * scan;
  float scanTrail = smoothstep(0.0, 0.55, 1.0 - scanY - uv.y) * scan * 0.2;

  // Mesh gradient underneath the isolines.
  vec3 mesh = mix(u_aurora1, u_aurora2, smoothstep(0.0, 1.0, uv.x * 0.7 + uv.y * 0.3));
  mesh = mix(mesh, u_aurora3, smoothstep(0.25, 0.95, warp.x) * 0.55);
  mesh = mix(mesh, u_glow, (1.0 - height) * 0.34);

  float meshStrength = hero > 0.5 ? 0.36 : (dark > 0.5 ? 0.3 : 0.22);
  vec3 color = mix(u_bg, mesh, meshStrength);

  // Gaps get a quiet warm signal instead of a warning.
  float gap = smoothstep(0.18, 0.42, 1.0 - height);
  vec3 lineColor = mix(u_line, u_signal, gap * (dark > 0.5 ? 0.55 : 0.3));

  float alphaThin = (hero > 0.5 ? 0.46 : 0.34) * thin;
  float alphaThick = (hero > 0.5 ? 0.8 : 0.58) * thick;
  color = mix(color, lineColor, alphaThin + alphaThick);
  color = mix(color, u_glow, scanTrail * 0.22);
  color = mix(color, u_glow * 1.35, scanLine * 0.85);

  // A soft glow around the index lines.
  float halo = exp(-pow(abs(fract(height * lineCount * 0.2) - 0.5), 2.0) * 40.0) * thick;
  color += u_glow * halo * (dark > 0.5 ? 0.16 : 0.06);

  // Vignette + bottom dissolve into the page canvas.
  float vignette = smoothstep(1.25, 0.25, length(uv - 0.5) * 1.35);
  color *= mix(dark > 0.5 ? 0.86 : 0.93, 1.0, vignette);
  float fade = smoothstep(0.0, hero > 0.5 ? 0.2 : 0.12, uv.y);
  color = mix(u_bg, color, fade);

  // Grain keeps the gradient from banding.
  float grain = hash(gl_FragCoord.xy + u_time * 0.1) - 0.5;
  color += grain * 0.018;

  outColor = vec4(color, 1.0);
}`;

const COLOR_VARIABLES = {
  background: "--color-canvas",
  aurora1: "--aurora-1",
  aurora2: "--aurora-2",
  aurora3: "--aurora-3",
  line: "--field-line",
  glow: "--field-glow",
  signal: "--signal",
} as const;

type Rgb = [number, number, number];

function parseColor(value: string, fallback: Rgb): Rgb {
  const raw = value.trim();
  if (!raw) return fallback;

  if (raw.startsWith("#")) {
    const hex = raw.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16) / 255,
        parseInt(hex[1] + hex[1], 16) / 255,
        parseInt(hex[2] + hex[2], 16) / 255,
      ];
    }
    if (hex.length >= 6) {
      return [
        parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255,
        parseInt(hex.slice(4, 6), 16) / 255,
      ];
    }
  }

  const match = raw.match(/rgba?\(([^)]+)\)/i);
  if (match) {
    const parts = match[1].split(/[\s,/]+/).map(Number);
    if (parts.length >= 3 && parts.every((part) => Number.isFinite(part))) {
      return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
    }
  }

  return fallback;
}

const FALLBACK_COLORS: Record<keyof typeof COLOR_VARIABLES, Rgb> = {
  background: [0.97, 0.97, 0.96],
  aurora1: [0.78, 0.82, 1],
  aurora2: [0.89, 0.82, 1],
  aurora3: [1, 0.88, 0.84],
  line: [0.19, 0.34, 0.84],
  glow: [0.55, 0.65, 1],
  signal: [0.82, 0.38, 0.25],
};

export function readFieldColors(element: HTMLElement): FieldColors {
  const style = getComputedStyle(element);
  const read = (key: keyof typeof COLOR_VARIABLES) =>
    parseColor(
      style.getPropertyValue(COLOR_VARIABLES[key]).trim(),
      FALLBACK_COLORS[key],
    );

  return {
    background: read("background"),
    aurora1: read("aurora1"),
    aurora2: read("aurora2"),
    aurora3: read("aurora3"),
    line: read("line"),
    glow: read("glow"),
    signal: read("signal"),
  };
}

let activeRenderer: FieldRenderer | null = null;

export function stopActiveField(): void {
  activeRenderer?.dispose();
  activeRenderer = null;
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function createFieldRenderer(
  canvas: HTMLCanvasElement,
  options: FieldOptions,
): FieldRenderer | null {
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
  } catch {
    return null;
  }
  if (!gl) return null;

  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  const rendererName = debugInfo
    ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? "")
    : "";
  if (/swiftshader|software|llvmpipe|basic render/i.test(rendererName)) {
    // Headless CI and very old GPUs render this shader on the CPU; the CSS
    // fallback is both cheaper and visually complete.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertex || !fragment) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }

  gl.useProgram(program);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const uniform = (name: string) => gl?.getUniformLocation(program, name) ?? null;
  const uniforms = {
    res: uniform("u_res"),
    time: uniform("u_time"),
    pointer: uniform("u_pointer"),
    scroll: uniform("u_scroll"),
    variant: uniform("u_variant"),
    bg: uniform("u_bg"),
    aurora1: uniform("u_aurora1"),
    aurora2: uniform("u_aurora2"),
    aurora3: uniform("u_aurora3"),
    line: uniform("u_line"),
    glow: uniform("u_glow"),
    signal: uniform("u_signal"),
  };

  const variantValue = { hero: 0, quiet: 1, dark: 2, scan: 3 }[options.variant];

  gl.uniform1f(uniforms.variant, variantValue);
  gl.uniform3fv(uniforms.bg, options.colors.background);
  gl.uniform3fv(uniforms.aurora1, options.colors.aurora1);
  gl.uniform3fv(uniforms.aurora2, options.colors.aurora2);
  gl.uniform3fv(uniforms.aurora3, options.colors.aurora3);
  gl.uniform3fv(uniforms.line, options.colors.line);
  gl.uniform3fv(uniforms.glow, options.colors.glow);
  gl.uniform3fv(uniforms.signal, options.colors.signal);

  let width = 0;
  let height = 0;

  const renderer: FieldRenderer = {
    resize(nextWidth, nextHeight, scale) {
      width = Math.max(1, Math.floor(nextWidth * scale));
      height = Math.max(1, Math.floor(nextHeight * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl?.viewport(0, 0, width, height);
    },
    frame({ time, pointer, scroll }) {
      if (!gl) return;
      gl.uniform2f(uniforms.res, width, height);
      gl.uniform1f(uniforms.time, time);
      gl.uniform2f(uniforms.pointer, pointer.x, pointer.y);
      gl.uniform1f(uniforms.scroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      if (!gl) return;
      gl.deleteProgram(program);
      if (vao) gl.deleteVertexArray(vao);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl = null;
      if (activeRenderer === renderer) activeRenderer = null;
    },
  };

  activeRenderer = renderer;
  return renderer;
}
