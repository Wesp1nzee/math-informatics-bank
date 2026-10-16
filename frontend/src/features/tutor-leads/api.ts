import { clientRequest } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { buildLeadMailto, buildLeadTelegramHref } from "@/features/tutor-leads/content";
import type {
  ContactChannels,
  TutorLeadInput,
  TutorLeadDelivery,
} from "@/features/tutor-leads/types";

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
