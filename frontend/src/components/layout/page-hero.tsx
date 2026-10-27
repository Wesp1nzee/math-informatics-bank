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

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
}: PageHeroProps) {
  return (
    <section className="desk:pt-[150px] desk:pb-16 w-full min-w-0 pt-[104px] pb-10 md:pt-32">
      <Container>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumbs className="mb-8" items={breadcrumbs} />
        ) : null}
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1 className="heading-2 max-w-[22ch] text-balance [overflow-wrap:anywhere]">
          {title}
        </h1>
        {description ? (
          <p className="body-large mt-6 max-w-full min-w-0">{description}</p>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
