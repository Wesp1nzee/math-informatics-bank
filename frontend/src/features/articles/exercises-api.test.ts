import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/client", () => ({
  clientRequest: vi.fn(),
}));

import { checkArticleExercise } from "@/features/articles/exercises-api";
import { clientRequest } from "@/lib/api/client";

const mockedRequest = vi.mocked(clientRequest);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("checkArticleExercise", () => {
  it("posts the answer to the article exercise endpoint", async () => {
    const result = {
      isCorrect: true,
      checkedAt: "2026-10-19T00:00:00Z",
      explanation: null,
      attempts: 1,
      solved: true,
    };
    mockedRequest.mockResolvedValue(result);

    await expect(checkArticleExercise("slug", "ex id", "a")).resolves.toEqual(result);
    expect(mockedRequest).toHaveBeenCalledWith(
      "/articles/slug/exercises/ex%20id/check",
      { method: "POST", body: { answer: "a" } },
    );
  });
});
