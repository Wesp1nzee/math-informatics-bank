"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { REQUEST_PATH } from "@/features/tutor-leads/content";
import { mainNav } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

export function MobileNav() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Открыть меню"
          className="border-line bg-surface text-ink inline-flex size-11 items-center justify-center rounded-md border"
        >
          <Menu aria-hidden className="size-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-ink/25 fixed inset-0 z-40" />
        <Dialog.Content
          className="border-line bg-canvas fixed inset-x-0 top-0 z-50 border-b px-5 pb-5 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.4)]"
          aria-label="Меню"
        >
          <Dialog.Title className="sr-only">Навигация</Dialog.Title>
          <Dialog.Description className="sr-only">
            Основные разделы сайта
          </Dialog.Description>

          <div className="flex h-16 items-center justify-between">
            <BrandLogo className="h-10" />
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Закрыть меню"
                className="border-line bg-surface text-ink inline-flex size-11 items-center justify-center rounded-md border"
              >
                <X aria-hidden className="size-5" />
              </button>
            </Dialog.Close>
          </div>

          <nav aria-label="Мобильная навигация" className="flex flex-col">
            {mainNav.map((item) => (
              <Dialog.Close asChild key={item.href}>
                <Link
                  href={item.href}
                  className="border-line text-ink border-b py-3.5 text-lg"
                >
                  {item.label}
                </Link>
              </Dialog.Close>
            ))}
          </nav>

          <div className="border-line flex items-center justify-between border-b py-3.5">
            <span className="text-ink-soft text-sm">Тема</span>
            <ThemeToggle />
          </div>

          <Dialog.Close asChild>
            <Link
              href={REQUEST_PATH}
              className={cn(buttonVariants({ variant: "primary" }), "mt-4 w-full")}
            >
              Записаться на пробное
            </Link>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
