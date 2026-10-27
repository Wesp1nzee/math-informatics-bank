import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TiltCard } from "@/components/ui/tilt-card";

describe("TiltCard", () => {
  it("renders children and a decorative specular layer", () => {
    render(
      <TiltCard className="test-card">
        <p>Карточка</p>
      </TiltCard>,
    );

    const card = screen.getByText("Карточка").parentElement;
    expect(card?.className).toContain("tilt-card");
    expect(card?.className).toContain("test-card");
    expect(card?.querySelector(".tilt-glare")).toBeTruthy();
  });
});
