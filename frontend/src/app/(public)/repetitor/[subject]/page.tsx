import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SubjectTutoringPage } from "@/features/seo/components/subject-tutoring-page";
import { getTutorLanding } from "@/features/seo/content-pages";
import { isSeoSubject } from "@/features/seo/pages";
import { buildMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ subject: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ subject: "matematika" }, { subject: "informatika" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subject } = await params;
  if (!isSeoSubject(subject)) {
    return buildMetadata({
      title: "Страница не найдена",
      description: "Такого раздела нет.",
      path: `/repetitor/${subject}`,
      noIndex: true,
    });
  }
  const landing = getTutorLanding(subject);
  if (!landing) {
    return buildMetadata({
      title: "Страница не найдена",
      description: "Такого раздела нет.",
      path: `/repetitor/${subject}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: landing.metaTitle,
    description: landing.metaDescription,
    path: landing.path,
  });
}

export default async function RepetitorSubjectPage({ params }: PageProps) {
  const { subject } = await params;
  if (!isSeoSubject(subject)) notFound();
  const landing = getTutorLanding(subject);
  if (!landing) notFound();
  return <SubjectTutoringPage landing={landing} />;
}
