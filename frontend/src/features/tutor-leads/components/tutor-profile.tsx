import { PlayCircle } from "lucide-react";
import type { CSSProperties } from "react";

import { hasTutorProfile, siteConfig } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

export function TutorProfile({
  className,
  large = false,
}: {
  className?: string;
  large?: boolean;
}) {
  if (!hasTutorProfile) return null;

  const { name, about, photo, video } = siteConfig.tutor;
  const paragraphs = about
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const initials = name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("");

  return (
    <div className={cn("grid grid-cols-12 items-start gap-4 md:gap-6", className)}>
      <div
        className={cn(
          "col-span-12 overflow-hidden rounded-xl border",
          large
            ? "desk:col-span-5 border-line bg-canvas"
            : "desk:col-span-4 border-line bg-canvas",
        )}
      >
        {photo ? (
          <div className="tutor-photo h-full">
            <img
              src={photo}
              alt={`${name} — преподаватель`}
              width={480}
              height={600}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="tutor-monogram" aria-hidden="true">
            <span>{initials}</span>
          </div>
        )}
      </div>

      <div
        className={cn(
          "col-span-12",
          large
            ? "desk:col-span-6 desk:col-start-7"
            : photo
              ? "desk:col-span-7 desk:col-start-6"
              : "desk:col-span-8",
        )}
      >
        <span className="eyebrow">Преподаватель</span>
        <h2
          id="tutor-title"
          className={cn(
            "mb-5 font-medium tracking-[-0.03em]",
            large ? "text-[clamp(40px,5vw,72px)] leading-[1.04]" : "heading-3",
          )}
        >
          {name}
        </h2>
        <div className="flex flex-col gap-3">
          {paragraphs.map((paragraph, index) => (
            <p
              key={paragraph}
              className="reveal text-ink-soft text-lg leading-relaxed"
              style={{ "--i": index } as CSSProperties}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {video ? (
          <a
            href={video}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-strong mt-6 inline-flex min-h-11 items-center gap-2 font-medium transition-colors"
          >
            <PlayCircle aria-hidden className="size-5" />
            Посмотреть знакомство
          </a>
        ) : null}
      </div>
    </div>
  );
}
