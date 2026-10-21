import { StateMessage } from "@/components/ui/state-message";
import { DeferredLeadForm } from "@/features/tutor-leads/components/deferred-lead-form";
import { isPublicApiConfigured } from "@/lib/api/config";
import { mailHref, siteConfig, telegramHref } from "@/lib/constants/site";

export function TutorLeadPanel({ formClassName }: { formClassName?: string }) {
  const telegram = telegramHref(siteConfig.tutor.telegram);
  const email = mailHref(siteConfig.tutor.email);
  const apiConfigured = isPublicApiConfigured();

  if (!apiConfigured && !telegram && !email) {
    if (process.env.NODE_ENV === "production") return null;

    return (
      <StateMessage
        title="Приём заявок пока не настроен"
        description="Задайте NEXT_PUBLIC_TUTOR_TELEGRAM или NEXT_PUBLIC_TUTOR_EMAIL (либо адрес API) в переменных окружения — после этого форма заявки появится здесь. Сейчас она скрыта, чтобы не имитировать отправку."
      />
    );
  }

  return (
    <DeferredLeadForm
      className={formClassName}
      channels={{ telegramHref: telegram, emailHref: email, apiConfigured }}
    />
  );
}
