"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { ContactChannels } from "@/features/tutor-leads/types";

const TutorLeadForm = dynamic(
  () => import("@/features/tutor-leads/components/lead-form").then((mod) => mod.TutorLeadForm),
  {
    ssr: false,
    loading: () => <LeadFormSkeleton />,
  },
);

function LeadFormSkeleton() {
  return (
    <div
      data-lead-form=""
      className="border-line bg-surface shadow-card flex min-h-[700px] flex-col gap-4 rounded-xl border p-6 md:min-h-[460px] md:p-8"
    >
      <p className="text-ink-soft text-sm">
        Достаточно контакта и экзамена — остальное можно не заполнять.
      </p>
      <div className="skeleton-line h-4 w-24" aria-hidden="true" />
      <div className="skeleton-line h-12 w-full" aria-hidden="true" />
      <div className="skeleton-line h-4 w-20" aria-hidden="true" />
      <div className="skeleton-line h-12 w-full" aria-hidden="true" />
      <div className="skeleton-line h-12 w-full" aria-hidden="true" />
      <div className="skeleton-line h-12 w-40" aria-hidden="true" />
      <p className="text-ink-faint mt-auto text-sm" role="status">
        Форма загружается…
      </p>
      <noscript>
        <p className="text-ink-soft text-sm">
          Для отправки заявки включите JavaScript или напишите напрямую в Telegram.
        </p>
      </noscript>
    </div>
  );
}

/**
 * The lead form carries react-hook-form and zod. Keep that weight out of the
 * first route bundle; mount it shortly before the form becomes visible.
 */
export function DeferredLeadForm({
  channels,
  className,
}: {
  channels: ContactChannels;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let timer = 0;

    const activate = () => {
      setActive(true);
      window.clearTimeout(timer);
    };

    if (typeof IntersectionObserver === "undefined") {
      timer = window.setTimeout(activate, 1200);
      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        activate();
      },
      { rootMargin: "700px 0px" },
    );
    observer.observe(element);

    // Anchor navigation can jump past the observer; a late idle fallback keeps
    // the form ready without putting it on the LCP path.
    timer = window.setTimeout(activate, 4000);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref}>
      {active ? (
        <TutorLeadForm channels={channels} className={className} />
      ) : (
        <LeadFormSkeleton />
      )}
    </div>
  );
}
