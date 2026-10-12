import type { Metadata } from "next";

import { SubjectHub } from "@/features/topics/components/subject-hub";
import { SUBJECT_CONTENT } from "@/features/topics/content";
import { buildMetadata } from "@/lib/seo/metadata";

const content = SUBJECT_CONTENT.informatika;

export const metadata: Metadata = buildMetadata({
  title: content.metaTitle,
  description: content.metaDescription,
  path: "/informatika",
});

export default function InformatikaPage() {
  return <SubjectHub subject="informatika" />;
}
