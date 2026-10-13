import type {
  DiagnosticAnswer,
  DiagnosticItem,
  DiagnosticReport,
  TopicResult,
} from "@/features/diagnostics/types";

/**
 * Deterministic selection: first one task per topic, then fill the rest round
 * robin. The order is stable so the same bank always yields the same set.
 */
export function selectDiagnosticItems(
  items: readonly DiagnosticItem[],
  size = 10,
): DiagnosticItem[] {
  if (items.length <= size) return [...items];

  const byTopic = new Map<string, DiagnosticItem[]>();
  for (const item of items) {
    const bucket = byTopic.get(item.topic);
    if (bucket) bucket.push(item);
    else byTopic.set(item.topic, [item]);
  }

  const queues = [...byTopic.values()];
  const result: DiagnosticItem[] = [];
  let guard = 0;

  while (result.length < size && guard < items.length * queues.length + 1) {
    for (const queue of queues) {
      if (result.length >= size) break;
      const next = queue.shift();
      if (next) result.push(next);
    }
    guard += 1;
  }

  return result.slice(0, size);
}

export function buildDiagnosticReport(
  items: readonly DiagnosticItem[],
  answers: readonly DiagnosticAnswer[],
): DiagnosticReport {
  const given = new Map(answers.map((answer) => [answer.id, answer.value]));
  const topicMap = new Map<string, TopicResult>();
  let correct = 0;

  for (const item of items) {
    const entry = topicMap.get(item.topic) ?? {
      topic: item.topic,
      total: 0,
      correct: 0,
    };
    entry.total += 1;

    if (given.get(item.id) === item.correct) {
      entry.correct += 1;
      correct += 1;
    }

    topicMap.set(item.topic, entry);
  }

  const topics = [...topicMap.values()];
  const weakTopics = topics
    .filter((topic) => topic.correct < topic.total)
    .sort(
      (a, b) =>
        a.correct / a.total - b.correct / b.total || b.total - a.total,
    )
    .map((topic) => topic.topic);

  return { total: items.length, correct, topics, weakTopics };
}
