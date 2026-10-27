import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PeekCarousel, PEEK_ITEM } from "@/components/ui/peek-carousel";

describe("PeekCarousel", () => {
  it("renders a snap rail with mobile progress dots", () => {
    render(
      <PeekCarousel count={3} label="Карточки">
        {[0, 1, 2].map((item) => (
          <article key={item} data-peek-item="" className={PEEK_ITEM}>
            Карточка {item + 1}
          </article>
        ))}
      </PeekCarousel>,
    );

    const rail = screen.getByLabelText("Карточки");
    expect(rail.className).toContain("snap-x");
    expect(rail.className).toContain("overflow-x-auto");
    expect(rail.querySelectorAll("[data-peek-item]")).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: /Перейти к карточке/ })).toHaveLength(
      3,
    );
  });

  it("keeps list semantics for review rails", () => {
    render(
      <PeekCarousel as="ul" count={2} label="Отзывы">
        <li data-peek-item="" className={PEEK_ITEM}>
          Первый
        </li>
        <li data-peek-item="" className={PEEK_ITEM}>
          Второй
        </li>
      </PeekCarousel>,
    );

    expect(screen.getByLabelText("Отзывы").tagName).toBe("UL");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
