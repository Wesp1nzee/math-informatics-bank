import type { TaskSubject } from "@/features/tasks/types";

export type DiagnosticOption = { value: string; label: string };

export type DiagnosticItem = {
  id: string;
  topic: string;
  subject: TaskSubject;
  prompt: string;
  options: readonly DiagnosticOption[];
  correct: string;
  explanation: string;

  isDemo: boolean;
};

export type DiagnosticAnswer = { id: string; value: string };

export type TopicResult = {
  topic: string;
  total: number;
  correct: number;
};

export type DiagnosticReport = {
  total: number;
  correct: number;
  topics: TopicResult[];

  weakTopics: string[];
};
