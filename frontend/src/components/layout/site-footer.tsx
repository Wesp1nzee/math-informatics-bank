import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { Container } from "@/components/layout/container";
import { footerNav } from "@/lib/constants/navigation";
import { mailHref, siteConfig, telegramHref } from "@/lib/constants/site";

const COPYRIGHT_YEAR = new Date().getFullYear();

export function SiteFooter() {
  const telegram = telegramHref(siteConfig.tutor.telegram);
  const email = mailHref(siteConfig.tutor.email);
  const hasContacts = telegram !== null || email !== null;

  return (
    <footer className="border-line border-t py-16 pb-12">
      <Container>
        <div className="grid w-full min-w-0 grid-cols-12 gap-x-4 gap-y-10 md:gap-x-6">
          <div className="desk:col-span-5 col-span-12 min-w-0">
            <BrandLogo className="h-14" />
          </div>

          <nav
            aria-label="Нижняя навигация"
            className="desk:col-span-3 col-span-6 grid min-w-0 content-start gap-1"
          >
            {footerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-ink-soft hover:text-accent inline-block py-1.5 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="desk:col-span-3 col-span-6 flex min-w-0 flex-col items-start">
            {hasContacts ? (
              <>
                {telegram ? (
                  <a
                    href={telegram}
                    className="text-ink-soft hover:text-accent inline-block max-w-full py-1.5 break-words transition-colors"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Telegram
                  </a>
                ) : null}
                {email ? (
                  <a
                    href={email}
                    className="text-ink-soft hover:text-accent inline-block max-w-full py-1.5 break-words transition-colors"
                  >
                    {siteConfig.tutor.email}
                  </a>
                ) : null}
              </>
            ) : (
              <Link
                href="/podgotovka"
                className="text-ink-soft hover:text-accent inline-block py-1.5 transition-colors"
              >
                Связаться по занятиям
              </Link>
            )}
          </div>

          <div className="border-line text-ink-faint col-span-12 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-8 text-sm">
            <span>© {COPYRIGHT_YEAR}</span>
            <Link href="/privacy" className="hover:text-ink-soft transition-colors">
              Политика обработки персональных данных
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
