import { StateMessage } from "@/components/ui/state-message";
import { TutorLeadForm } from "@/features/tutor-leads/components/lead-form";
import { isPublicApiConfigured } from "@/lib/api/config";
import { mailHref, siteConfig, telegramHref } from "@/lib/constants/site";

/**
 * Decides how a tutoring request can actually be delivered:
 * backend → Telegram → e-mail. When nothing is configured the form is replaced
 * by an explicit notice instead of a button that pretends to work.
 */
export function TutorLeadPanel() {
  const telegram = telegramHref(siteConfig.tutor.telegram);
  const email = mailHref(siteConfig.tutor.email);
  const apiConfigured = isPublicApiConfigured();

  if (!apiConfigured && !telegram && !email) {
    return (
      <StateMessage
        title="Приём заявок пока не настроен"
        description="Задайте NEXT_PUBLIC_TUTOR_TELEGRAM или NEXT_PUBLIC_TUTOR_EMAIL (либо адрес API) в переменных окружения — после этого форма заявки появится здесь. Сейчас она скрыта, чтобы не имитировать отправку."
      />
    );
  }

  return (
    <TutorLeadForm
      channels={{ telegramHref: telegram, emailHref: email, apiConfigured }}
    />
  );
}
