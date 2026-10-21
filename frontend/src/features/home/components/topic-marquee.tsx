import { Marquee } from "@/components/motion/marquee";
import { SUBJECT_CONTENT } from "@/features/topics/content";

const TOPICS = Array.from(
  new Set([
    "Производная",
    "Логарифмы",
    "Двоичная запись",
    "Графы",
    "Вероятность",
    ...SUBJECT_CONTENT.matematika.covers,
    ...SUBJECT_CONTENT.informatika.covers,
  ]),
);

export function TopicMarquee() {
  return (
    <Marquee
      items={TOPICS}
      label="Темы математики и информатики"
      className="border-t-0"
    />
  );
}
