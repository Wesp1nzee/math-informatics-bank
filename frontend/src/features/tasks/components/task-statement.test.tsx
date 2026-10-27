import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TaskStatement } from "@/features/tasks/components/task-statement";
import type { StatementBlock } from "@/features/tasks/types";

describe("TaskStatement", () => {
  it("keeps tables and formulas inside scrollable mobile containers", () => {
    const blocks: StatementBlock[] = [
      {
        type: "table",
        caption: "Данные",
        headers: ["x", "y"],
        rows: [
          ["1", "2"],
          ["3", "4"],
        ],
      },
      { type: "formula", tex: "x^2 + y^2 = z^2", caption: "Теорема" },
    ];

    render(<TaskStatement blocks={blocks} />);

    const table = screen.getByRole("table");
    const scroller = table.parentElement;
    expect(scroller?.className).toContain("overflow-x-auto");
    expect(scroller?.className).toContain("max-w-full");

    const formula = screen.getByText("Теорема").closest("figure");
    expect(formula?.className).toContain("overflow-x-auto");
    expect(formula?.className).toContain("max-w-full");
  });

  it("renders ФИПИ media with max-w-full and h-auto", () => {
    render(
      <TaskStatement
        blocks={[
          {
            type: "image",
            src: "/images/fipi.png",
            alt: "Рисунок из банка ФИПИ",
            caption: "Источник: ФИПИ",
          },
        ]}
      />,
    );

    const image = screen.getByRole("img", { name: "Рисунок из банка ФИПИ" });
    expect(image.className).toContain("max-w-full");
    expect(image.className).toContain("h-auto");
    expect(screen.getByText("Источник: ФИПИ")).toBeInTheDocument();
  });

  it("renders heading and quote blocks", () => {
    render(
      <TaskStatement
        blocks={[
          { type: "heading", text: "Условие", id: "statement-heading" },
          { type: "quote", text: "Важная оговорка" },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Условие" })).toHaveAttribute(
      "id",
      "statement-heading",
    );
    expect(screen.getByText("Важная оговорка").tagName).toBe("BLOCKQUOTE");
  });
});
