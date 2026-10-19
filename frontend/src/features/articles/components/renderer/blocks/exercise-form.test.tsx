import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/articles/exercises-api", () => ({
  checkArticleExercise: vi.fn(),
}));

import { NumericInputBlock } from "@/features/articles/components/renderer/blocks/numeric-input-block";
import { SingleChoiceBlock } from "@/features/articles/components/renderer/blocks/single-choice-block";
import {
  checkArticleExercise,
  type ExerciseCheckResult,
} from "@/features/articles/exercises-api";
import type { ArticleBlockV2 } from "@/features/articles/types";
import { ApiError } from "@/lib/api/errors";

const mockedCheck = vi.mocked(checkArticleExercise);

function choiceBlock(): Extract<ArticleBlockV2, { type: "single_choice" }> {
  return {
    id: "ex-choice",
    type: "single_choice",
    data: {
      prompt: [{ type: "text", text: "2 + 2?" }],
      options: [
        { id: "a", label: [{ type: "text", text: "4" }] },
        { id: "b", label: [{ type: "text", text: "5" }] },
      ],
    },
  };
}

function numericBlock(): Extract<ArticleBlockV2, { type: "numeric_input" }> {
  return {
    id: "ex-number",
    type: "numeric_input",
    data: {
      prompt: [{ type: "text", text: "3.5" }],
      unit: "см",
    },
  };
}

function result(overrides: Partial<ExerciseCheckResult> = {}): ExerciseCheckResult {
  return {
    isCorrect: true,
    checkedAt: "2026-10-19T00:00:00Z",
    explanation: null,
    attempts: 1,
    solved: false,
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("exercise blocks", () => {
  it("checks a selected option and shows the explanation", async () => {
    mockedCheck.mockResolvedValue(
      result({
        explanation: [{ type: "text", text: "2 + 2 = 4" }],
        solved: true,
      }),
    );

    render(<SingleChoiceBlock block={choiceBlock()} articleSlug="demo" />);
    fireEvent.click(screen.getByRole("radio", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "Проверить" }));

    await screen.findByText("Верно.");
    expect(mockedCheck).toHaveBeenCalledWith("demo", "ex-choice", "a");
    expect(screen.getByText("2 + 2 = 4")).toBeInTheDocument();
    expect(screen.getByText("Прогресс сохранён.")).toBeInTheDocument();
    expect(screen.getByText("Попытка 1")).toBeInTheDocument();
  });

  it("allows retrying after a wrong answer", async () => {
    mockedCheck.mockResolvedValue(
      result({ isCorrect: false, attempts: 1, solved: false }),
    );

    render(<SingleChoiceBlock block={choiceBlock()} articleSlug="demo" />);
    fireEvent.click(screen.getByRole("radio", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "Проверить" }));

    await screen.findByText("Пока неверно. Попробуйте ещё раз.");
    expect(screen.queryByText("Объяснение")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Попробовать снова" }));
    expect(screen.queryByText("Пока неверно. Попробуйте ещё раз.")).toBeNull();
    expect((screen.getByRole("radio", { name: "5" }) as HTMLInputElement).checked).toBe(
      false,
    );
  });

  it("checks a numeric answer and shows the explanation", async () => {
    mockedCheck.mockResolvedValue(
      result({ explanation: [{ type: "text", text: "Ответ 3.5" }] }),
    );

    render(<NumericInputBlock block={numericBlock()} articleSlug="demo" />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "3,5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Проверить" }));

    await screen.findByText("Верно.");
    expect(mockedCheck).toHaveBeenCalledWith("demo", "ex-number", "3,5");
    expect(screen.getByText("Ответ 3.5")).toBeInTheDocument();
  });

  it("shows an accessible error when the check fails", async () => {
    mockedCheck.mockRejectedValue(new ApiError("network", "down"));

    render(<NumericInputBlock block={numericBlock()} articleSlug="demo" />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "3.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Проверить" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Нет связи с сервером/);
  });

  it("disables checking when no article slug is available", () => {
    render(<SingleChoiceBlock block={choiceBlock()} />);

    expect(screen.getByRole("button", { name: "Проверить" })).toBeDisabled();
    expect(screen.getByText(/доступна только на странице статьи/)).toBeInTheDocument();
  });

  it("disables the submit while a check is in flight", async () => {
    let resolveCheck!: (value: ExerciseCheckResult) => void;
    mockedCheck.mockReturnValue(
      new Promise<ExerciseCheckResult>((resolve) => {
        resolveCheck = resolve;
      }),
    );

    render(<SingleChoiceBlock block={choiceBlock()} articleSlug="demo" />);
    fireEvent.click(screen.getByRole("radio", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "Проверить" }));

    const pending = await screen.findByRole("button", { name: "Проверяем…" });
    expect(pending).toBeDisabled();

    resolveCheck(result({ solved: true }));
    await waitFor(() => expect(screen.getByText("Верно.")).toBeInTheDocument());
  });
});
