import "@testing-library/jest-dom/vitest";

/**
 * jsdom does not implement `matchMedia`, which the reduced-motion hooks use.
 * Provide a minimal stub that reports "no preference".
 */
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
