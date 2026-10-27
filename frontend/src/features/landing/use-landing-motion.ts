"use client";

import { useEffect, type RefObject } from "react";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function ease(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOut(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

function segment(time: number, start: number, end: number): number {
  return clamp((time - start) / (end - start), 0, 1);
}

type Visualizer = {
  on: boolean;
  time: number;
  update: (time: number) => void;
};

/**
 * Scroll choreography and the two animated SVG illustrations.
 * Shared one requestAnimationFrame loop, paused when nothing is visible.
 */
export function useLandingMotion(rootRef: RefObject<HTMLDivElement | null>): void {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const query = <T extends Element>(selector: string): T | null =>
      root.querySelector<T>(selector);

    let reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let viewportHeight = window.innerHeight;

    /* ---------- reveal, parallax, process route ---------- */

    const revealItems = Array.from(root.querySelectorAll<HTMLElement>("[data-r]"));
    const parallaxItems = Array.from(root.querySelectorAll<HTMLElement>("[data-p]"));
    const visualItems = Array.from(root.querySelectorAll<HTMLElement>(".viz"));

    const revealGroups = new Map<Element, number>();
    for (const element of revealItems) {
      const group = element.closest("section") ?? root;
      const index = revealGroups.get(group) ?? 0;
      revealGroups.set(group, index + 1);
      element.style.setProperty("--stagger-index", String(Math.min(index, 6)));
    }

    const pendingReveals = new Set(revealItems);

    const finishReveal = (element: HTMLElement) => {
      element.style.filter = "none";
      element.style.willChange = "auto";
      element.dataset.revealed = "";
    };

    const revealElement = (element: HTMLElement) => {
      if (!pendingReveals.delete(element)) return;
      element.dataset.inView = "";

      const onTransitionEnd = (event: TransitionEvent) => {
        if (event.target !== element || event.propertyName !== "filter") return;
        element.removeEventListener("transitionend", onTransitionEnd);
        finishReveal(element);
      };
      element.addEventListener("transitionend", onTransitionEnd);
      window.setTimeout(() => finishReveal(element), 1200);
    };

    const revealObserver =
      !reduce && typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting) revealElement(entry.target as HTMLElement);
              }
            },
            { threshold: 0.16, rootMargin: "0px 0px -7% 0px" },
          )
        : null;

    if (reduce || !revealObserver) {
      for (const element of revealItems) {
        element.dataset.inView = "";
        if (!reduce) finishReveal(element);
      }
    } else {
      for (const element of revealItems) revealObserver.observe(element);
    }

    const trackPath = query<SVGPathElement>("#pl");
    const trackBase = query<SVGPathElement>("#pb");
    const progressDot = query<HTMLElement>("#pdot");
    const track = query<HTMLElement>("#track");
    const nodes = track ? Array.from(track.querySelectorAll<HTMLElement>(".node")) : [];
    const steps = Array.from(root.querySelectorAll<HTMLElement>(".step"));

    const curveHeight = (x: number): number =>
      60 + 26 * Math.sin((x / 1000) * Math.PI * 3);

    let path = "";
    for (let x = 0; x <= 1000; x += 10) {
      path += `${x ? "L" : "M"}${x} ${curveHeight(x).toFixed(1)}`;
    }
    trackPath?.setAttribute("d", path);
    trackBase?.setAttribute("d", path);

    nodes.forEach((node) => {
      const x = Number(node.dataset.x);
      node.style.left = `${x / 10}%`;
      node.style.top = `${curveHeight(x)}px`;
    });

    let scrollQueued = false;

    const onScroll = (): void => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
        const y = window.scrollY;

        if (!reduce) {
          if (revealObserver && pendingReveals.size > 0) {
            const limit = viewportHeight * 0.94;
            for (const element of Array.from(pendingReveals)) {
              if (element.getBoundingClientRect().top < limit) {
                revealElement(element);
              }
            }
          }

          visualItems.forEach((element) => {
            const bounds = element.getBoundingClientRect();
            element.style.setProperty(
              "translate",
              `0 ${((bounds.top + bounds.height / 2 - viewportHeight / 2) * 0.05).toFixed(1)}px`,
            );
          });

          parallaxItems.forEach((element) => {
            element.style.setProperty(
              "translate",
              `0 ${(-y * Number(element.dataset.p)).toFixed(1)}px`,
            );
          });
        }

        if (track && trackPath && progressDot) {
          const bounds = track.getBoundingClientRect();
          const progress = reduce
            ? 1
            : clamp(
                (viewportHeight * 0.82 - bounds.top) / (viewportHeight * 0.42),
                0,
                1,
              );
          trackPath.setAttribute("stroke-dashoffset", String(1 - progress));
          progressDot.style.left = `${progress * 100}%`;
          progressDot.style.top = `${curveHeight(progress * 1000)}px`;

          nodes.forEach((node, index) => {
            const active = progress * 1000 >= Number(node.dataset.x) - 4;
            node.classList.toggle("on", active);
            steps[index]?.classList.toggle("on", active);
          });
        }
      });
    };

    const onResize = (): void => {
      viewportHeight = window.innerHeight;
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    /* ---------- illustrations: one shared timeline loop ---------- */

    const curve = query<SVGPathElement>("#mCurve");
    const axis = query<SVGPathElement>("#mAx");
    const grid = query<SVGPathElement>("#mGrid");
    const dot = query<SVGGElement>("#mDot");
    const vertical = query<SVGPathElement>("#mPv");
    const horizontal = query<SVGPathElement>("#mPh");
    const labelX = query<SVGTextElement>("#mLx");
    const labelY = query<SVGTextElement>("#mLy");

    const algorithmEdges = Array.from(
      root.querySelectorAll<SVGPathElement>("#aE path"),
    );
    const algorithmNodes = Array.from(
      root.querySelectorAll<SVGCircleElement>("#aN circle"),
    );
    const algorithmLime = Array.from(
      root.querySelectorAll<SVGCircleElement>("#aL circle"),
    );
    const routeOne = query<SVGPathElement>("#aR1");
    const routeTwo = query<SVGPathElement>("#aR2");
    const algorithmDot = query<SVGCircleElement>("#aD");
    const algorithmHalo = query<SVGCircleElement>("#aH");

    let curveLength = 0;
    if (curve) {
      curveLength = curve.getTotalLength() + 2;
      curve.setAttribute("stroke-dasharray", String(curveLength));
    }

    const updateCurve = (time: number): void => {
      if (
        !curve ||
        !axis ||
        !grid ||
        !dot ||
        !vertical ||
        !horizontal ||
        !labelX ||
        !labelY ||
        !curveLength
      ) {
        return;
      }

      const showAxes = easeOut(segment(time, 0, 0.8));
      const showGrid = easeOut(segment(time, 0.3, 1.3));
      const draw = ease(segment(time, 0.7, 2.5));
      let showDot = easeOut(segment(time, 2.3, 3));
      let showProjection = easeOut(segment(time, 2.7, 3.4));
      let showLabels = easeOut(segment(time, 3, 3.7));

      const cycle = reduce ? 0 : Math.max(0, time - 2.3) % 9;
      const position = reduce
        ? 0.48
        : cycle < 6
          ? 0.22 + 0.5 * ease(cycle / 6)
          : cycle < 8.2
            ? 0.72
            : 0.22;
      const fade =
        reduce || cycle < 7.4
          ? 1
          : cycle < 8.2
            ? 1 - easeOut((cycle - 7.4) / 0.8)
            : easeOut((cycle - 8.2) / 0.8);

      showDot *= fade;
      showProjection *= fade;
      showLabels *= fade;

      const point = curve.getPointAtLength(position * (curveLength - 2));
      const x = Number(point.x.toFixed(2));
      const y = Number(point.y.toFixed(2));

      axis.style.opacity = String(showAxes);
      grid.style.opacity = String(showGrid * 0.55);
      curve.setAttribute("stroke-dashoffset", String(curveLength * (1 - draw)));

      dot.setAttribute(
        "transform",
        `translate(${x} ${y}) scale(${(0.4 + 0.6 * showDot).toFixed(3)})`,
      );
      dot.style.opacity = String(showDot);
      vertical.setAttribute("d", `M${x} ${y}V170`);
      horizontal.setAttribute("d", `M${x} ${y}H30`);
      vertical.style.opacity = String(showProjection);
      horizontal.style.opacity = String(showProjection);
      labelX.setAttribute("x", String(x));
      labelY.setAttribute("y", String(y + 4));
      labelX.style.opacity = String(showLabels);
      labelY.style.opacity = String(showLabels);
    };

    const edgeLengths = algorithmEdges.map((edge) => edge.getTotalLength());
    const routeOneLength = routeOne?.getTotalLength() ?? 0;
    const routeTwoLength = routeTwo?.getTotalLength() ?? 0;
    const edgeDelays = [0, 0.18, 0.5, 0.62, 0.74, 0.86];

    algorithmEdges.forEach((edge, index) => {
      edge.setAttribute("stroke-dasharray", String(edgeLengths[index]));
    });
    routeOne?.setAttribute("stroke-dasharray", String(routeOneLength));
    routeTwo?.setAttribute("stroke-dasharray", String(routeTwoLength));

    const updateAlgorithm = (time: number): void => {
      algorithmEdges.forEach((edge, index) => {
        edge.setAttribute(
          "stroke-dashoffset",
          String(
            edgeLengths[index] *
              (1 - ease(segment(time, edgeDelays[index], edgeDelays[index] + 0.6))),
          ),
        );
      });

      algorithmNodes.forEach((node, index) => {
        const delay = index ? edgeDelays[index - 1] + 0.45 : 0;
        const progress = easeOut(segment(time, delay, delay + 0.5));
        node.setAttribute("r", (8 * (0.55 + 0.45 * progress)).toFixed(2));
        node.style.opacity = String(progress);
      });

      const cycle = time - 2.2;
      let firstRoute = 0;
      let secondRoute = 0;
      const lime = [0, 0, 0];
      let showDot = 0;
      let visible = 1;

      if (reduce) {
        firstRoute = 1;
        secondRoute = 1;
        lime[2] = 1;
      } else if (cycle >= 0) {
        const local = cycle % 6;
        showDot = easeOut(segment(local, 0, 0.4));
        lime[0] = showDot;
        firstRoute = ease(segment(local, 0.4, 1.5));
        lime[1] = easeOut(segment(local, 1.4, 1.8));
        secondRoute = ease(segment(local, 1.8, 2.9));
        lime[2] = easeOut(segment(local, 2.8, 3.2));
        visible = 1 - easeOut(segment(local, 4.7, 5.6));
      }

      routeOne?.setAttribute(
        "stroke-dashoffset",
        String(routeOneLength * (1 - firstRoute)),
      );
      routeTwo?.setAttribute(
        "stroke-dashoffset",
        String(routeTwoLength * (1 - secondRoute)),
      );
      if (routeOne) routeOne.style.opacity = String(visible);
      if (routeTwo) routeTwo.style.opacity = String(visible);

      algorithmLime.forEach((node, index) => {
        node.style.opacity = String(lime[index] * visible);
      });

      if (algorithmDot && algorithmHalo) {
        const x = secondRoute > 0 ? 330 - 55 * secondRoute : 220 + 110 * firstRoute;
        const y = secondRoute > 0 ? 90 + 75 * secondRoute : 20 + 70 * firstRoute;
        algorithmDot.setAttribute("cx", String(x));
        algorithmDot.setAttribute("cy", String(y));
        algorithmHalo.setAttribute("cx", String(x));
        algorithmHalo.setAttribute("cy", String(y));
        algorithmDot.style.opacity = String(reduce ? 0 : showDot * visible);
        algorithmHalo.style.opacity = String(reduce ? 0 : showDot * visible * 0.3);
      }
    };

    const visualizers: Visualizer[] = [];
    const visualObservers: IntersectionObserver[] = [];
    let activeVisualizers = 0;
    let loopRaf = 0;
    let lastLoop = 0;

    const loop = (now: number): void => {
      loopRaf = requestAnimationFrame(loop);
      const delta = Math.min(Math.max((now - lastLoop) / 1000, 0), 0.05);
      lastLoop = now;
      if (document.hidden) return;
      visualizers.forEach((visualizer) => {
        if (!visualizer.on) return;
        visualizer.time += delta;
        visualizer.update(visualizer.time);
      });
    };

    const register = (
      svg: SVGSVGElement | null,
      update: (time: number) => void,
    ): void => {
      if (!svg) return;
      const visualizer: Visualizer = { on: false, time: -0.4, update };
      visualizers.push(visualizer);

      if (reduce) {
        update(99);
        return;
      }

      update(-1);

      const observer = new IntersectionObserver(
        (entries) => {
          const on = entries[0]?.isIntersecting ?? false;
          if (on === visualizer.on) return;
          visualizer.on = on;
          activeVisualizers += on ? 1 : -1;
          if (activeVisualizers > 0 && !loopRaf) {
            lastLoop = performance.now();
            loopRaf = requestAnimationFrame(loop);
          } else if (activeVisualizers <= 0 && loopRaf) {
            cancelAnimationFrame(loopRaf);
            loopRaf = 0;
          }
        },
        { rootMargin: "-8% 0px -8% 0px", threshold: 0.3 },
      );
      visualObservers.push(observer);
      observer.observe(svg);
    };

    register(curve?.ownerSVGElement ?? null, updateCurve);
    register(algorithmEdges[0]?.ownerSVGElement ?? null, updateAlgorithm);

    /* ---------- reduced-motion switch ---------- */

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = (event: MediaQueryListEvent): void => {
      reduce = event.matches;
      if (!reduce) {
        window.location.reload();
        return;
      }
      cancelAnimationFrame(loopRaf);
      loopRaf = 0;
      visualizers.forEach((visualizer) => {
        visualizer.on = false;
        visualizer.update(99);
      });
      revealItems.forEach((element) => {
        element.dataset.inView = "";
        element.style.opacity = "";
        element.style.transform = "";
        element.style.filter = "";
        element.style.willChange = "";
      });
      revealObserver?.disconnect();
      [...parallaxItems, ...visualItems].forEach((element) => {
        element.style.removeProperty("translate");
      });
      onScroll();
    };
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      motionQuery.removeEventListener("change", onMotionChange);
      revealObserver?.disconnect();
      visualObservers.forEach((observer) => observer.disconnect());
      cancelAnimationFrame(loopRaf);
    };
  }, [rootRef]);
}
