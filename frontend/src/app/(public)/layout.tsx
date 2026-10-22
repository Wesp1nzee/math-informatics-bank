import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { StickyCta } from "@/features/tutor-leads/components/sticky-cta";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="focus:border-line focus:bg-surface sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-60 focus:rounded-md focus:border focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Перейти к содержимому
      </a>
      <SiteHeader />
      <main id="main" className="relative z-[1] flex-1">
        {children}
      </main>
      <div className="relative z-[1]">
        <SiteFooter />
      </div>
      <StickyCta />
      <ScrollReveal />
    </>
  );
}
