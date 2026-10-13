import { PlayCircle } from "lucide-react";

import { hasTutorProfile, siteConfig } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

/**
 * Factual teacher block. It only appears when both a name and a short bio are
 * configured — no invented experience, photo or biography. Photo and intro
 * video are optional and rendered only when provided.
 */
export function TutorProfile({ className }: { className?: string }) {
  if (!hasTutorProfile) return null;

  const { name, about, photo, video } = siteConfig.tutor;
  const paragraphs = about
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className={cn("grid grid-cols-12 items-start gap-4 md:gap-6", className)}>
      {photo ? (
        <div className="border-line bg-canvas desk:col-span-4 col-span-12 overflow-hidden rounded-xl border">
          {/* Arbitrary owner-provided URL: a plain img avoids remote-domain config. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt={`${name} — преподаватель`}
            width={480}
            height={600}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div
        className={cn(
          "col-span-12",
          photo ? "desk:col-span-7 desk:col-start-6" : "desk:col-span-8",
        )}
      >
        <span className="eyebrow">Преподаватель</span>
        <h2 id="tutor-title" className="heading-3 mb-5">
          {name}
        </h2>
        <div className="flex flex-col gap-3">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-ink-soft text-lg leading-relaxed">
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
