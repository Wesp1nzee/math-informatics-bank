export type TaskSubject = "matematika" | "informatika";
export type TaskDifficulty = "easy" | "medium" | "hard";

/** A block of a task statement. `$...$` inside text is inline math. */
export type StatementBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "formula"; tex: string; caption?: string };

export type SolutionStep = {
  /** Short explanation shown above the formula. */
  note: string;
  /** LaTeX for the step. */
  tex: string;
};

export type TaskAnswer = {
  /** Canonical answer, used for comparison. */
  value: string;
  kind: "number" | "text";
  /** Explanation shown together with the solution. */
  explanation: string;
};

export type Task = {
  id: string;
  title: string;
  subject: TaskSubject;
  /** Badge label, e.g. "ЕГЭ · Профиль". */
  examLabel: string;
  level: TaskDifficulty;
  /** Estimated solving time in minutes. */
  minutes: number;
  /** Card summary. */
  summary: string;
  statement: StatementBlock[];
  answer: TaskAnswer;
  steps: SolutionStep[];
  topics: string[];
  /** Shown on the home page bank preview. */
  featured?: boolean;
  /** Marks the built-in demo dataset. */
  isDemo: boolean;
};
