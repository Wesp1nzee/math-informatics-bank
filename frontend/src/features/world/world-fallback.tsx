import { heightAt, LANDSCAPE, WORLD_SIZE } from "@/features/world/landscape";

/**
 * Static, no-JS fallback rendered before (and behind) the WebGL world. It
 * draws real isolines of the same landscape using marching squares, plus a
 * gradient and grain, so the background is never empty or flashing white.
 */

const VIEW_W = 1200;
const VIEW_H = 900;
const PAD = 40;

const LEVELS = 11;

function toSvg(x: number, z: number): [number, number] {
  const span = VIEW_W - PAD * 2;
  const sx = PAD + ((x + WORLD_SIZE / 2) / WORLD_SIZE) * span;
  const sy = VIEW_H - (PAD + ((z + WORLD_SIZE / 2) / WORLD_SIZE) * span);
  return [sx, sy];
}

function buildContours(): string[] {
  const N = 44;
  const step = WORLD_SIZE / N;
  const minH = -2.4;
  const maxH = 4.2;
  const paths: string[] = [];

  for (let li = 0; li < LEVELS; li += 1) {
    const level = minH + ((maxH - minH) * li) / (LEVELS - 1);
    let d = "";

    for (let iz = 0; iz < N; iz += 1) {
      for (let ix = 0; ix < N; ix += 1) {
        const x0 = -WORLD_SIZE / 2 + ix * step;
        const z0 = -WORLD_SIZE / 2 + iz * step;
        const params = { ...LANDSCAPE, relief: 1, morph: 1, signal: 0.55 };
        const h00 = heightAt(x0, z0, params);
        const h10 = heightAt(x0 + step, z0, params);
        const h01 = heightAt(x0, z0 + step, params);
        const h11 = heightAt(x0 + step, z0 + step, params);

        // Marching-squares case bits.
        const c00 = h00 >= level ? 1 : 0;
        const c10 = h10 >= level ? 1 : 0;
        const c01 = h01 >= level ? 1 : 0;
        const c11 = h11 >= level ? 1 : 0;
        const code = c00 | (c10 << 1) | (c11 << 2) | (c01 << 3);
        if (code === 0 || code === 15) continue;

        const ixBottom = x0 + ((level - h00) / (h10 - h00)) * step;
        const ixTop = x0 + ((level - h01) / (h11 - h01)) * step;
        const izLeft = z0 + ((level - h00) / (h01 - h00)) * step;
        const izRight = z0 + ((level - h10) / (h11 - h10)) * step;

        const pBottom = toSvg(ixBottom, z0);
        const pTop = toSvg(ixTop, z0 + step);
        const pLeft = toSvg(x0, izLeft);
        const pRight = toSvg(x0 + step, izRight);

        const seg = (a: [number, number], b: [number, number]) =>
          `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;

        // Draw the contour segment(s) for this cell.
        if (code === 1 || code === 14) d += seg(pBottom, pLeft);
        else if (code === 2 || code === 13) d += seg(pRight, pBottom);
        else if (code === 4 || code === 11) d += seg(pTop, pRight);
        else if (code === 8 || code === 7) d += seg(pLeft, pTop);
        else if (code === 3 || code === 12) d += seg(pRight, pLeft);
        else if (code === 6 || code === 9) d += seg(pBottom, pTop);
        else {
          // Saddle cases: two segments.
          d += seg(pBottom, pLeft);
          d += seg(pTop, pRight);
        }
      }
    }

    if (d) paths.push(d);
  }

  return paths;
}

export function WorldFallback() {
  const contours = buildContours();

  return (
    <div className="world-fallback" aria-hidden="true">
      <div className="world-fallback-glow world-fallback-glow-a" />
      <div className="world-fallback-glow world-fallback-glow-b" />
      <svg
        className="world-fallback-svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        {contours.map((d, index) => (
          <path key={index} d={d} className="world-contour" />
        ))}
      </svg>
      <div className="world-fallback-grain" />
    </div>
  );
}
