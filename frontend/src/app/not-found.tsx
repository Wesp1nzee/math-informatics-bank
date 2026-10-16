import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-1 items-center py-32">
        <Container>
          <span className="eyebrow">404</span>
          <h1 className="heading-2 max-w-[22ch]">Страница не найдена</h1>
          <p className="body-large mt-6">
            Возможно, ссылка устарела или в адресе опечатка. Начните с банка задач — там
            есть условия, ответы и решения.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/zadachi">Открыть банк задач</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">На главную</Link>
            </Button>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
