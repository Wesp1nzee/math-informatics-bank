import { describe, expect, it } from "vitest";

import { DEMO_DIAGNOSTIC_ITEMS } from "@/features/diagnostics/fixtures";
import { buildDiagnosticReport, selectDiagnosticItems } from "@/features/diagnostics/scoring";
import type { DiagnosticItem } from "@/features/diagnostics/types";

function item(id: string, topic: string, correct: string): DiagnosticItem {
  return {
    id,
    topic,
    subject: "matematika",
    prompt: `Задача ${id}`,
    options: [
      { value: correct, label: correct },
      { value: "wrong", label: "wrong" },
    ],
    correct,
    explanation: "",
    isDemo: true,
  };
}

describe("buildDiagnosticReport", () => {
  const items = [
    item("1", "Проценты", "a"),
    item("2", "Проценты", "b"),
    item("3", "Логарифмы", "c"),
  ];

  it("counts correct answers per topic", () => {
    const report = buildDiagnosticReport(items, [
      { id: "1", value: "a" },
      { id: "2", value: "wrong" },
      { id: "3", value: "c" },
    ]);

    expect(report.total).toBe(3);
    expect(report.correct).toBe(2);
    expect(report.topics).toEqual([
      { topic: "Проценты", total: 2, correct: 1 },
      { topic: "Логарифмы", total: 1, correct: 1 },
    ]);
    expect(report.weakTopics).toEqual(["Проценты"]);
  });

  it("treats unanswered questions as mistakes", () => {
    const report = buildDiagnosticReport(items, [{ id: "1", value: "a" }]);
    expect(report.correct).toBe(1);
    expect(report.weakTopics).toEqual(["Логарифмы", "Проценты"]);
  });

  it("reports no weak topics when everything is correct", () => {
    const report = buildDiagnosticReport(items, [
      { id: "1", value: "a" },
      { id: "2", value: "b" },
      { id: "3", value: "c" },
    ]);
    expect(report.weakTopics).toEqual([]);
  });
});

describe("selectDiagnosticItems", () => {
  it("returns the whole set when it already fits", () => {
    expect(selectDiagnosticItems(DEMO_DIAGNOSTIC_ITEMS, 10)).toHaveLength(10);
    expect(selectDiagnosticItems(DEMO_DIAGNOSTIC_ITEMS, 10)).toEqual(
      DEMO_DIAGNOSTIC_ITEMS,
    );
  });

  it("caps the result at the requested size", () => {
    expect(selectDiagnosticItems(DEMO_DIAGNOSTIC_ITEMS, 4)).toHaveLength(4);
  });

  it("spreads the selection across topics before repeating one", () => {
    const selected = selectDiagnosticItems(DEMO_DIAGNOSTIC_ITEMS, 5);
    const topics = selected.map((entry) => entry.topic);
    expect(new Set(topics).size).toBe(5);
  });
});
