import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Главная — в разработке",
  description: "Страница временно заменена заглушкой.",
  path: "/",
  noIndex: true,
});

export default function HomePage() {
  return (
    <section className="desk:pt-[150px] desk:pb-16 pt-[104px] pb-10 md:pt-32">
      <Container>
        <h1 className="heading-2">Главная</h1>
        <p className="body-large mt-6 max-w-[60ch]">
          Страница временно заменена текстовой заглушкой. Скоро здесь появится новая
          версия.
        </p>
      </Container>
    </section>
  );
}
