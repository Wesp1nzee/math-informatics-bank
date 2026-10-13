import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { submitTutorLead } = vi.hoisted(() => ({
  submitTutorLead: vi.fn(async () => "api" as const),
}));

vi.mock("@/features/tutor-leads/api", () => ({ submitTutorLead }));

import { TutorLeadForm } from "@/features/tutor-leads/components/lead-form";

const channels = {
  telegramHref: "https://t.me/tutor",
  emailHref: null,
  apiConfigured: true,
};

describe("TutorLeadForm", () => {
  beforeEach(() => {
    submitTutorLead.mockClear();
  });

  it("requires only contact and consent, leaving the rest optional", async () => {
    const user = userEvent.setup();
    render(<TutorLeadForm channels={channels} />);

    await user.click(screen.getByRole("button", { name: "Отправить заявку" }));
    expect(await screen.findByText(/Оставьте Telegram/)).toBeInTheDocument();
    expect(submitTutorLead).not.toHaveBeenCalled();

    await user.type(
      screen.getByLabelText("Как с вами связаться"),
      "@student",
    );
    await user.click(screen.getByLabelText(/Согласен на обработку/));
    await user.click(screen.getByRole("button", { name: "Отправить заявку" }));

    await waitFor(() => expect(submitTutorLead).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Заявка отправлена")).toBeInTheDocument();

    const call = submitTutorLead.mock.calls[0] as unknown as [
      { name?: string; contact: string; exam: string },
    ];
    const input = call[0];
    expect(input.name).toBeUndefined();
    expect(input.contact).toBe("@student");
    expect(input.exam).toBe("ege");
  });

  it("offers a Telegram quick path with a prefilled message", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    render(<TutorLeadForm channels={channels} />);

    await user.click(screen.getByRole("button", { name: /Написать в Telegram/ }));

    expect(open).toHaveBeenCalledTimes(1);
    const url = String(open.mock.calls[0]?.[0] ?? "");
    expect(url).toContain("https://t.me/tutor?text=");
    expect(decodeURIComponent(url)).toContain("Заявка на занятия");
    open.mockRestore();
  });
});
