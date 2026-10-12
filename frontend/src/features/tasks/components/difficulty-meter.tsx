import { DIFFICULTY_LABEL, DIFFICULTY_ORDER } from "@/features/tasks/labels";
import type { TaskDifficulty } from "@/features/tasks/types";

/**
 * Three-bar difficulty meter. The bars are decorative; the level name is
 * exposed to assistive technology through a visually hidden label.
 */
export function DifficultyMeter({ level }: { level: TaskDifficulty }) {
  const filled = DIFFICULTY_ORDER[level];

  return (
    <>
      <span className="diff" aria-hidden="true">
        {[1, 2, 3].map((bar) => (
          <i key={bar} data-on={bar <= filled ? "" : undefined} />
        ))}
      </span>
      <span>{DIFFICULTY_LABEL[level]}</span>
    </>
  );
}
