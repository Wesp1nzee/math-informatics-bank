import Link from "next/link";

import { Container } from "@/components/layout/container";
import { footerNav } from "@/lib/constants/navigation";
import { brand, mailHref, siteConfig, telegramHref } from "@/lib/constants/site";

/** Copyright year is resolved once at module load (build time for static pages). */
const COPYRIGHT_YEAR = new Date().getFullYear();

export function SiteFooter() {
  const telegram = telegramHref(siteConfig.tutor.telegram);
  const email = mailHref(siteConfig.tutor.email);
  const hasContacts = telegram !== null || email !== null;

  return (
    <footer className="border-line border-t py-16 pb-12">
      <Container>
        <div className="grid grid-cols-12 gap-x-4 gap-y-10 md:gap-x-6">
          <div className="desk:col-span-5 col-span-12">
            <b className="block text-xl font-semibold">
              {brand.text}
              <span className="text-accent">{brand.accent}</span>
            </b>
            <span className="text-ink-soft">Математика × Информатика</span>
          </div>

          <nav
            aria-label="Нижняя навигация"
            className="desk:col-span-3 col-span-6 grid content-start gap-1"
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

          <div className="desk:col-span-3 col-span-6 flex flex-col items-start">
            {hasContacts ? (
              <>
                {telegram ? (
                  <a
                    href={telegram}
                    className="text-ink-soft hover:text-accent inline-block py-1.5 transition-colors"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Telegram
                  </a>
                ) : null}
                {email ? (
                  <a
                    href={email}
                    className="text-ink-soft hover:text-accent inline-block py-1.5 transition-colors"
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

          <p className="border-line text-ink-faint col-span-12 border-t pt-8 text-sm">
            © {COPYRIGHT_YEAR}
          </p>
        </div>
      </Container>
    </footer>
  );
}
