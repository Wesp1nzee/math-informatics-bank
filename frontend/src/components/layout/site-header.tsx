"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/lib/constants/navigation";
import { brand } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

/**
 * Fixed site header. Becomes opaque once the page is scrolled, matching the
 * original prototype's `.nav.scrolled` behaviour.
 */
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
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-[14px] transition-colors duration-300",
        scrolled ? "border-line bg-canvas/88" : "bg-canvas/60 border-transparent",
      )}
    >
      <Container>
        <nav
          aria-label="Основная навигация"
          className="desk:gap-12 flex h-16 items-center gap-8"
        >
          <Link href="/" className="text-lg font-semibold tracking-[-0.01em]">
            {brand.text}
            <span className="text-accent">{brand.accent}</span>
          </Link>

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

          <div className="ml-auto hidden md:block">
            <Button asChild size="sm">
              <Link href="/zadachi">Начать решать</Link>
            </Button>
          </div>

          <div className="ml-auto md:hidden">
            <MobileNav />
          </div>
        </nav>
      </Container>
    </header>
  );
}
