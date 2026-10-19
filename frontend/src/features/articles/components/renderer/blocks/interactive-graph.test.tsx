import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { InteractiveGraph } from "@/features/articles/components/renderer/blocks/interactive-graph";
import type { InteractiveGraphBlockData } from "@/features/articles/types";

function makeData(
  overrides: Partial<InteractiveGraphBlockData> = {},
): InteractiveGraphBlockData {
  return {
    engine: "svg",
    expressions: [{ id: "f", expr: "a*x", label: "f(x)" }],
    parameters: [{ id: "a", label: "a", min: 0, max: 2, step: 0.5, default: 1 }],
    viewport: { x_min: -5, x_max: 5, y_min: -5, y_max: 5 },
    interactions: ["zoom", "trace"],
    ...overrides,
  };
}

function curvePath(): SVGPathElement {
  const path = document.querySelector<SVGPathElement>("path[data-graph-curve]");
  if (!path) throw new Error("curve path not found");
  return path;
}

function installFrameQueue() {
  const queue: Array<{ id: number; callback: FrameRequestCallback }> = [];
  let nextId = 1;

  const request = vi
    .spyOn(window, "requestAnimationFrame")
    .mockImplementation((callback: FrameRequestCallback) => {
      const id = nextId;
      nextId += 1;
      queue.push({ id, callback });
      return id;
    });
  const cancel = vi
    .spyOn(window, "cancelAnimationFrame")
    .mockImplementation((id: number) => {
      const index = queue.findIndex((frame) => frame.id === id);
      if (index >= 0) queue.splice(index, 1);
    });

  return {
    pending: () => queue.length,
    flush(timestamp: number) {
      const frame = queue.shift();
      if (!frame) throw new Error("no pending frame");
      act(() => {
        frame.callback(timestamp);
      });
    },
    run(timestamps: number[]) {
      for (const timestamp of timestamps) {
        this.flush(timestamp);
      }
    },
    restore() {
      request.mockRestore();
      cancel.mockRestore();
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("InteractiveGraph", () => {
  it("keeps the target on the slider while the curve is smoothed", async () => {
    render(<InteractiveGraph data={makeData()} />);

    const slider = screen.getByRole("slider", { name: "Параметр a" });
    const before = curvePath().getAttribute("d");
    expect(before).toBeTruthy();

    fireEvent.change(slider, { target: { value: "2" } });

    // The slider (target) is immediate; the plotted curve (displayed) lags.
    expect(slider).toHaveValue("2");
    expect(curvePath().getAttribute("d")).toBe(before);

    await waitFor(() => {
      expect(curvePath().getAttribute("d")).not.toBe(before);
    });
  });

  it("updates each path at most once per animation frame", () => {
    const frames = installFrameQueue();
    try {
      render(<InteractiveGraph data={makeData()} />);

      const slider = screen.getByRole("slider", { name: "Параметр a" });
      const path = curvePath();
      const setAttribute = vi.spyOn(path, "setAttribute");

      fireEvent.change(slider, { target: { value: "2" } });
      fireEvent.change(slider, { target: { value: "1.7" } });
      expect(frames.pending()).toBe(1);

      frames.flush(16.67);

      const writes = setAttribute.mock.calls.filter(([name]) => name === "d");
      expect(writes).toHaveLength(1);
    } finally {
      frames.restore();
    }
  });

  it("skips smoothing when the user prefers reduced motion", () => {
    const media = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    try {
      render(<InteractiveGraph data={makeData()} />);
      const slider = screen.getByRole("slider", { name: "Параметр a" });
      const before = curvePath().getAttribute("d");

      fireEvent.change(slider, { target: { value: "2" } });

      expect(curvePath().getAttribute("d")).not.toBe(before);
    } finally {
      window.matchMedia = media;
    }
  });

  it("uses a fine pointer step and snaps to the article step on release", () => {
    render(<InteractiveGraph data={makeData()} />);
    const slider = screen.getByRole("slider", {
      name: "Параметр a",
    }) as HTMLInputElement;

    expect(Number(slider.step)).toBeLessThanOrEqual(0.5);

    fireEvent.change(slider, { target: { value: "1.23" } });
    expect(slider.value).toBe("1.23");

    fireEvent.pointerUp(slider);
    expect(slider.value).toBe("1");

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.value).toBe("1.5");

    fireEvent.keyDown(slider, { key: "Home" });
    expect(slider.value).toBe("0");

    fireEvent.keyDown(slider, { key: "End" });
    expect(slider.value).toBe("2");
  });

  it("throttles trace updates to one animation frame", () => {
    const frames = installFrameQueue();
    try {
      render(<InteractiveGraph data={makeData()} />);
      const svg = screen.getByRole("img", {
        name: /Интерактивный график/,
      });

      vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
        width: 480,
        height: 280,
        left: 0,
        top: 0,
        right: 480,
        bottom: 280,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect);

      fireEvent.pointerMove(svg, { clientX: 100, clientY: 140 });
      fireEvent.pointerMove(svg, { clientX: 240, clientY: 140 });
      fireEvent.pointerMove(svg, { clientX: 300, clientY: 140 });
      expect(frames.pending()).toBe(1);

      frames.flush(16.67);

      const readout = document.querySelector("[data-graph-readout] span");
      expect(readout).toHaveAttribute("aria-live", "off");
      expect(readout?.textContent).toMatch(/x = 1\.44/);
    } finally {
      frames.restore();
    }
  });

  it("animates zoom and reset without recreating grid lines", async () => {
    render(<InteractiveGraph data={makeData()} />);

    const firstGridLine = () =>
      document.querySelector<SVGLineElement>("[data-graph-grid] line");
    const before = firstGridLine()?.getAttribute("x1");

    fireEvent.click(screen.getByRole("button", { name: "Приблизить график" }));

    await waitFor(
      () => {
        expect(firstGridLine()?.getAttribute("x1")).not.toBe(before);
      },
      { timeout: 3000 },
    );

    const zoomed = firstGridLine();
    fireEvent.click(screen.getByRole("button", { name: "Сбросить вид" }));

    await waitFor(
      () => {
        expect(firstGridLine()?.getAttribute("x1")).toBe(before);
      },
      { timeout: 3000 },
    );
    expect(firstGridLine()).toBe(zoomed);
  });

  it("isolates a broken expression without dropping the valid one", () => {
    render(
      <InteractiveGraph
        data={makeData({
          expressions: [
            { id: "bad", expr: "alert(1)", label: "bad" },
            { id: "good", expr: "x", label: "good" },
          ],
        })}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/bad/);
    expect(document.querySelector("path[data-graph-curve]")).toBeTruthy();
  });

  it("exposes accessible controls", () => {
    render(<InteractiveGraph data={makeData()} />);

    expect(
      screen.getByRole("img", { name: /Интерактивный график/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Параметр a" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Приблизить график" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Отдалить график" })).toBeInTheDocument();
  });
});
