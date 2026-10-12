"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Насколько раньше нижней границы окна показывать элемент. */
const OFFSET = 40;

/**
 * Показывает элементы с классом `.reveal`, когда они попадают во вьюпорт.
 *
 * Почему не `IntersectionObserver`:
 *
 * 1. Он живёт в layout, а layout при client-side навигации не перемонтируется.
 *    Observer продолжал бы следить за узлами предыдущей страницы, а новые
 *    `.reveal` никогда бы не показались. Поэтому эффект перезапускается по
 *    `usePathname()`, а не один раз за загрузку.
 * 2. При быстрой прокрутке, нажатии <kbd>End</kbd> или перетаскивании
 *    скроллбара `IntersectionObserver` может не увидеть элемент ни в одном
 *    кадре, и он навсегда остался бы скрытым.
 *
 * Проверка по `scroll`/`resize` детерминирована: показывается всё, что находится
 * в окне или уже выше него. Без JavaScript контент виден всегда — скрытие
 * включает только `@media (scripting: enabled)` (см. globals.css).
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    let pending = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (pending.length === 0) return;

    function show(element: HTMLElement) {
      element.dataset.revealIn = "";
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const element of pending) show(element);
      return;
    }

    let frame = 0;
    let detached = false;

    function detach() {
      if (detached) return;
      detached = true;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    }

    function flush() {
      frame = 0;
      const limit = window.innerHeight - OFFSET;
      const remaining: HTMLElement[] = [];

      for (const element of pending) {
        if (element.getBoundingClientRect().top < limit) show(element);
        else remaining.push(element);
      }

      pending = remaining;
      if (pending.length === 0) detach();
    }

    function schedule() {
      if (frame === 0) frame = window.requestAnimationFrame(flush);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    flush();

    return detach;
  }, [pathname]);

  return null;
}
