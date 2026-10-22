import { PlayCircle } from "lucide-react";

import { hasTutorProfile, siteConfig } from "@/lib/constants/site";

export function TutorProfile({ className }: { className?: string }) {
  if (!hasTutorProfile) return null;

  const { name, about, photo, video } = siteConfig.tutor;
  const paragraphs = about
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2);
  const initials = name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("");

  return (
    <div className={className}>
      <div className="grid grid-cols-12 items-start gap-8">
        <div className="desk:col-span-4 col-span-12">
          <div className="border-line overflow-hidden rounded-2xl border">
            {photo ? (
              <img
                src={photo}
                alt={`${name} — преподаватель`}
                width={480}
                height={600}
                loading="lazy"
                className="h-auto w-full object-cover"
              />
            ) : (
              <div className="tutor-monogram" aria-hidden="true">
                <span>{initials}</span>
              </div>
            )}
          </div>
        </div>

        <div className="desk:col-span-7 desk:col-start-6 col-span-12">
          <h2 id="tutor-title" className="heading-3 mb-4">
            {name}
          </h2>
          <div className="flex flex-col gap-3">
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-ink-soft text-base leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {video ? (
            <a
              href={video}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-strong mt-5 inline-flex min-h-11 items-center gap-2 font-medium transition-colors"
            >
              <PlayCircle aria-hidden className="size-5" />
              Посмотреть знакомство
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
