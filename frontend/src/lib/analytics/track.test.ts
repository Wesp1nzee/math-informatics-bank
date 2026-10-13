import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ANALYTICS_EVENTS, track } from "@/lib/analytics/track";

const ENV_KEY = "NEXT_PUBLIC_YM_ID";

describe("track", () => {
  beforeEach(() => {
    delete window.ym;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete window.ym;
  });

  it("is a no-op without NEXT_PUBLIC_YM_ID", () => {
    vi.stubEnv(ENV_KEY, "");
    const ym = vi.fn();
    window.ym = ym;

    track(ANALYTICS_EVENTS.quizAnswer, { correct: true });

    expect(ym).not.toHaveBeenCalled();
  });

  it("does not throw when the tag is not loaded yet", () => {
    vi.stubEnv(ENV_KEY, "12345678");
    expect(() => track(ANALYTICS_EVENTS.solutionOpen)).not.toThrow();
  });

  it("sends reachGoal with the counter id when configured", () => {
    vi.stubEnv(ENV_KEY, "12345678");
    const ym = vi.fn();
    window.ym = ym;

    track(ANALYTICS_EVENTS.ctaClick, { placement: "after-solution" });

    expect(ym).toHaveBeenCalledWith(12345678, "reachGoal", "cta_click", {
      placement: "after-solution",
    });
  });

  it("never forwards personal data from the form", () => {
    vi.stubEnv(ENV_KEY, "123");
    const ym = vi.fn();
    window.ym = ym;

    track(ANALYTICS_EVENTS.leadFormSubmit, {
      channel: "api",
      name: "Иван",
      contact: "@ivan",
      message: "текст",
    });

    expect(ym).toHaveBeenCalledWith(123, "reachGoal", "lead_form_submit", {
      channel: "api",
    });
  });
});
