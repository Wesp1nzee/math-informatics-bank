import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/seo/breadcrumbs";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: readonly BreadcrumbItem[];
  children?: ReactNode;
};

/**
 * Shared header block for every inner page: breadcrumbs, the single `<h1>`,
 * an optional lead paragraph and optional trailing content (filters, CTAs).
 */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
}: PageHeroProps) {
  return (
    <section className="desk:pt-[150px] desk:pb-16 pt-[104px] pb-10 md:pt-32">
      <Container>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumbs className="mb-8" items={breadcrumbs} />
        ) : null}
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1 className="heading-2 max-w-[22ch] text-balance">{title}</h1>
        {description ? <p className="body-large mt-6">{description}</p> : null}
        {children}
      </Container>
    </section>
  );
}
