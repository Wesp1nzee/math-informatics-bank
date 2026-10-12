import { clientRequest } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { buildLeadMailto, buildLeadTelegramHref } from "@/features/tutor-leads/content";
import type {
  ContactChannels,
  TutorLeadInput,
  TutorLeadDelivery,
} from "@/features/tutor-leads/types";

/**
 * Delivers a tutoring request.
 *
 * Delivery order:
 *  1. `POST /tutor-leads` — used as soon as the FastAPI backend is configured.
 *  2. Telegram deep link with a prefilled message.
 *  3. `mailto:` link with a prefilled subject and body.
 *
 * Until the backend exists, options 2–3 make the form genuinely work without a
 * server — it opens the applicant's own client with the message ready to send.
 * When no channel is configured at all, the caller must not render the form.
 */
export async function submitTutorLead(
  input: TutorLeadInput,
  channels: ContactChannels,
): Promise<TutorLeadDelivery> {
  if (channels.apiConfigured) {
    await clientRequest<void>("/tutor-leads", { method: "POST", body: input });
    return "api";
  }

  if (channels.telegramHref) {
    window.location.assign(buildLeadTelegramHref(channels.telegramHref, input));
    return "telegram";
  }

  if (channels.emailHref) {
    window.location.assign(buildLeadMailto(channels.emailHref, input));
    return "email";
  }

  throw ApiError.unconfigured("No contact channel is configured for tutor leads");
}
