import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button, ButtonArrow } from "@/components/ui/button";

/** Closing call to action. Points at the real task catalogue. */
export function FinalCta() {
  return (
    <section
      aria-labelledby="final-title"
      className="border-line desk:py-40 border-t py-24 md:py-[120px]"
    >
      <Container>
        <div className="reveal">
          <h2
            id="final-title"
            className="text-[clamp(48px,8vw,120px)] leading-[0.95] font-medium tracking-[-0.05em]"
          >
            Готовы
            <br />
            попробовать?
          </h2>
          <p className="text-ink-soft my-7 text-xl md:text-2xl">
            Начните с одной задачи.
          </p>
          <Button asChild>
            <Link href="/zadachi">
              Открыть банк задач <ButtonArrow />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
