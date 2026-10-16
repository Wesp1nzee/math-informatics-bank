export type TaskSubject = "matematika" | "informatika";
export type TaskDifficulty = "easy" | "medium" | "hard";

export type StatementBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "formula"; tex: string; caption?: string };

export type SolutionStep = {
  note: string;
  tex: string;
};

export type TaskAnswer = {
  value: string;
  kind: "number" | "text";
  explanation: string;
};

export type Task = {
  id: string;
  title: string;
  subject: TaskSubject;
  examLabel: string;
  level: TaskDifficulty;
  minutes: number;
  summary: string;
  statement: StatementBlock[];
  answer: TaskAnswer;
  steps: SolutionStep[];
  topics: string[];
  featured?: boolean;
  isDemo: boolean;
};
