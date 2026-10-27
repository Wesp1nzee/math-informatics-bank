"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/layout/brand-logo";
import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { REQUEST_PATH } from "@/features/tutor-leads/content";
import { mainNav } from "@/lib/constants/navigation";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="site-header fixed inset-x-0 top-0 z-50 w-full max-w-full overflow-x-clip border-b backdrop-blur-[26px] backdrop-saturate-[1.7]"
    >
      <Container>
        <nav
          aria-label="Основная навигация"
          className="desk:gap-12 flex h-16 w-full min-w-0 items-center gap-3 sm:gap-8"
        >
          <BrandLogo priority className="h-11 sm:h-12" />

          <ul className="text-ink-soft hidden list-none gap-8 p-0 text-[15px] md:flex">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="hover:text-ink block py-2 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <ThemeToggle className="hidden md:inline-flex" />

            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href={REQUEST_PATH}>Записаться на пробное</Link>
            </Button>

            <Button asChild size="sm" className="md:hidden">
              <Link href={REQUEST_PATH}>Записаться</Link>
            </Button>

            <div className="md:hidden">
              <MobileNav />
            </div>
          </div>
        </nav>
      </Container>
    </header>
  );
}
