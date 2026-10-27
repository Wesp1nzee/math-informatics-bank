import { afterEach, describe, expect, it, vi } from "vitest";

import { triggerHaptic } from "@/lib/utils/haptics";

const originalVibrate = navigator.vibrate;

afterEach(() => {
  Object.defineProperty(navigator, "vibrate", {
    configurable: true,
    value: originalVibrate,
  });
  vi.restoreAllMocks();
});

describe("triggerHaptic", () => {
  it("forwards a default short pulse", () => {
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, "vibrate", {
      configurable: true,
      value: vibrate,
    });

    triggerHaptic();

    expect(vibrate).toHaveBeenCalledWith(8);
  });

  it("forwards custom patterns", () => {
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, "vibrate", {
      configurable: true,
      value: vibrate,
    });

    triggerHaptic([10, 20, 10]);

    expect(vibrate).toHaveBeenCalledWith([10, 20, 10]);
  });

  it("swallows unsupported or blocked implementations", () => {
    Object.defineProperty(navigator, "vibrate", {
      configurable: true,
      value: () => {
        throw new Error("blocked");
      },
    });

    expect(() => triggerHaptic()).not.toThrow();
  });
});
