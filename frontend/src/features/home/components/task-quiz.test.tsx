import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { TaskQuiz } from "@/features/home/components/task-quiz";

function renderQuiz() {
  return render(
    <TaskQuiz
      tag="ЕГЭ · Профиль"
      title="Производная"
      prompt={<span>Найдите значение f′(2)</span>}
      formula={<span>f(x)=x³−4x²+7x</span>}
      options={[
        { value: "0", label: "0" },
        { value: "3", label: "3" },
        { value: "7", label: "7" },
        { value: "12", label: "12" },
      ]}
      correctValue="3"
      hints={{ "0": "Проверьте степень." }}
      successNote="Сначала производная, потом подстановка."
      steps={[{ note: "Производная", content: <span>f′(x)=3x²−8x+7</span> }]}
      moreHref="/zadachi"
    />,
  );
}

describe("TaskQuiz", () => {
  it("renders all answer options as enabled buttons", () => {
    renderQuiz();
    expect(screen.getAllByRole("button")).toHaveLength(4);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeEnabled();
    }
  });

  it("shows the hint for a wrong answer and marks the correct one", async () => {
    const user = userEvent.setup();
    renderQuiz();

    await user.click(screen.getByRole("button", { name: "0" }));

    expect(await screen.findByText("Не совсем.")).toBeInTheDocument();
    expect(screen.getByText(/Проверьте степень\./)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toHaveAttribute(
      "data-state",
      "right",
    );
  });

  it("confirms a correct answer and reveals the solution", async () => {
    const user = userEvent.setup();
    renderQuiz();

    await user.click(screen.getByRole("button", { name: "3" }));

    expect(await screen.findByText("Верно.")).toBeInTheDocument();
    expect(await screen.findByText("f′(x)=3x²−8x+7")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Разобрать подробнее/ })).toHaveAttribute(
      "href",
      "/zadachi",
    );
  });

  it("allows retrying after answering", async () => {
    const user = userEvent.setup();
    renderQuiz();

    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(await screen.findByRole("button", { name: "Попробовать снова" }));

    expect(screen.queryByText("Не совсем.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "0" })).toBeEnabled();
  });
});
