import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/server", () => ({
  isServerApiConfigured: vi.fn(),
  serverRequest: vi.fn(),
}));

import { getArticleBySlug, getArticles } from "@/features/articles/api";
import type { Article } from "@/features/articles/types";
import { ApiError } from "@/lib/api/errors";
import { isServerApiConfigured, serverRequest } from "@/lib/api/server";

const mockedConfigured = vi.mocked(isServerApiConfigured);
const mockedRequest = vi.mocked(serverRequest);

const article: Article = {
  slug: "interactive",
  title: "Interactive",
  description: "d",
  subject: "matematika",
  exam: "ЕГЭ",
  readingMinutes: 5,
  published: "2026-01-01",
  blocks: [],
  content: { version: 2, blocks: [] },
  isDemo: false,
};

beforeEach(() => {
  vi.resetAllMocks();
  mockedConfigured.mockReturnValue(true);
});

describe("article API loading", () => {
  it("returns an article with structured content from the API", async () => {
    mockedRequest.mockResolvedValue(article);

    await expect(getArticleBySlug("interactive")).resolves.toEqual(article);
    expect(mockedRequest).toHaveBeenCalledWith("/articles/interactive");
  });

  it("returns null when the API responds with 404", async () => {
    mockedRequest.mockRejectedValue(new ApiError("http", "not found", { status: 404 }));

    await expect(getArticleBySlug("missing")).resolves.toBeNull();
  });

  it("rethrows non-404 API errors", async () => {
    mockedRequest.mockRejectedValue(new ApiError("network", "down"));

    await expect(getArticleBySlug("interactive")).rejects.toBeInstanceOf(ApiError);
  });

  it("returns the published list from the API", async () => {
    mockedRequest.mockResolvedValue([article]);

    await expect(getArticles()).resolves.toEqual({
      items: [article],
      isDemo: false,
    });
  });

  it("falls back to local fixtures when the API is not configured", async () => {
    mockedConfigured.mockReturnValue(false);

    const result = await getArticleBySlug("proizvodnaya-ne-pro-formuly");

    expect(result?.slug).toBe("proizvodnaya-ne-pro-formuly");
    expect(mockedRequest).not.toHaveBeenCalled();
  });
});
