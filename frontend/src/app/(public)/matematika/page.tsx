import type { Metadata } from "next";

import { SubjectHub } from "@/features/topics/components/subject-hub";
import { SUBJECT_CONTENT } from "@/features/topics/content";
import { buildMetadata } from "@/lib/seo/metadata";

const content = SUBJECT_CONTENT.matematika;

export const metadata: Metadata = buildMetadata({
  title: content.metaTitle,
  description: content.metaDescription,
  path: "/matematika",
});

export default function MatematikaPage() {
  return <SubjectHub subject="matematika" />;
}
