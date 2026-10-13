"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { REQUEST_PATH } from "@/features/tutor-leads/content";
import { mainNav } from "@/lib/constants/navigation";
import { brand } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

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
            <span className="text-accent hidden sm:inline">{brand.accent}</span>
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

          <div className="ml-auto flex items-center gap-2">
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
