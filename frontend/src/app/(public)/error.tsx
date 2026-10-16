"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[public] route error", error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center py-32">
      <Container>
        <span className="eyebrow">Ошибка</span>
        <h1 className="heading-2 max-w-[20ch]">Что-то пошло не так</h1>
        <p className="body-large mt-6">
          Страница не загрузилась. Попробуйте обновить — если ошибка повторяется,
          вернитесь на главную или в банк задач.
        </p>
        {error.digest ? (
          <p className="text-ink-faint mt-4 text-sm">Код ошибки: {error.digest}</p>
        ) : null}
        <div className="mt-10 flex flex-wrap gap-3">
          <Button type="button" onClick={reset}>
            Попробовать снова
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">На главную</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
