import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AnswerForm } from "@/features/tasks/components/answer-form";

function renderForm() {
  return render(
    <AnswerForm
      expected="3"
      kind="number"
      answerNote="Сначала производная, потом подстановка."
      solution={<p>f′(x) = 3x² − 8x + 7</p>}
    />,
  );
}

function solutionPanel() {
  return document.querySelector("[data-solution]");
}

describe("AnswerForm", () => {
  it("confirms a correct answer", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Ваш ответ"), "3");
    await user.click(screen.getByRole("button", { name: "Проверить" }));

    expect(await screen.findByText("Верно.")).toBeInTheDocument();
    expect(solutionPanel()).toHaveAttribute("data-open", "true");
  });

  it("rejects a wrong answer and keeps the solution collapsed", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Ваш ответ"), "12");
    await user.click(screen.getByRole("button", { name: "Проверить" }));

    expect(await screen.findByText(/Пока неверно/)).toBeInTheDocument();
    expect(solutionPanel()).not.toHaveAttribute("data-open");
  });

  it("reveals the solution on demand, even without answering", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /Показать решение/ }));

    expect(solutionPanel()).toHaveAttribute("data-open", "true");
    expect(screen.getByText(/f′\(x\) = 3x² − 8x \+ 7/)).toBeInTheDocument();
  });

  it("resets back to the initial state", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Ваш ответ"), "3");
    await user.click(screen.getByRole("button", { name: "Проверить" }));
    await user.click(await screen.findByRole("button", { name: /Попробовать снова/ }));

    expect(screen.queryByText("Верно.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Ваш ответ")).toHaveValue("");
    expect(solutionPanel()).not.toHaveAttribute("data-open");
  });
});
