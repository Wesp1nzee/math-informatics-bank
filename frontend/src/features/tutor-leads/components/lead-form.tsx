"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, CircleCheck, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitTutorLead } from "@/features/tutor-leads/api";
import { SUBJECT_OPTIONS } from "@/features/tutor-leads/content";
import {
  tutorLeadSchema,
  type TutorLeadFormValues,
} from "@/features/tutor-leads/schema";
import type { ContactChannels, TutorLeadDelivery } from "@/features/tutor-leads/types";
import { describeApiError } from "@/lib/api/errors";

const DELIVERY_MESSAGE: Record<TutorLeadDelivery, string> = {
  api: "Заявка отправлена. Свяжусь с вами, чтобы договориться о времени.",
  telegram: "Открываю Telegram с готовым сообщением — останется нажать «Отправить».",
  email: "Открываю почтовый клиент с готовым письмом — останется нажать «Отправить».",
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-danger mt-1.5 text-sm">
      {message}
    </p>
  );
}

/**
 * Tutoring request form.
 *
 * Validation is shared with the (future) API contract through the Zod schema.
 * Depending on configuration the submit either POSTs to the backend or opens
 * the applicant's own Telegram / mail client with a prefilled message, so the
 * form is functional even before the backend exists.
 */
export function TutorLeadForm({ channels }: { channels: ContactChannels }) {
  const [delivery, setDelivery] = useState<TutorLeadDelivery | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TutorLeadFormValues>({
    resolver: zodResolver(tutorLeadSchema),
    defaultValues: {
      name: "",
      contact: "",
      subject: "matematika",
      message: "",
      consent: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setPending(true);
    setFailure(null);
    try {
      const result = await submitTutorLead(
        {
          name: values.name,
          contact: values.contact,
          subject: values.subject,
          message: values.message,
          consent: true,
        },
        channels,
      );
      setDelivery(result);
      reset();
    } catch (error) {
      setFailure(describeApiError(error));
    } finally {
      setPending(false);
    }
  });

  if (delivery) {
    return (
      <div
        role="status"
        className="border-success/40 bg-success-soft flex flex-col items-start gap-3 rounded-xl border p-6 md:p-8"
      >
        <CircleCheck aria-hidden className="text-success size-6" />
        <p className="text-ink text-lg font-medium">
          {delivery === "api" ? "Заявка отправлена" : "Сообщение готово"}
        </p>
        <p className="text-ink-soft">{DELIVERY_MESSAGE[delivery]}</p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-2"
          onClick={() => setDelivery(null)}
        >
          Отправить ещё одну
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="border-line bg-surface flex flex-col gap-5 rounded-xl border p-6 md:p-8"
    >
      <div>
        <Label htmlFor="lead-name">Имя</Label>
        <Input
          id="lead-name"
          className="mt-2"
          autoComplete="name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "lead-name-error" : undefined}
          {...register("name")}
        />
        <FieldError id="lead-name-error" message={errors.name?.message} />
      </div>

      <div>
        <Label htmlFor="lead-contact">Как с вами связаться</Label>
        <Input
          id="lead-contact"
          className="mt-2"
          autoComplete="email"
          placeholder="Telegram, e‑mail или телефон"
          aria-invalid={errors.contact ? true : undefined}
          aria-describedby={errors.contact ? "lead-contact-error" : undefined}
          {...register("contact")}
        />
        <FieldError id="lead-contact-error" message={errors.contact?.message} />
      </div>

      <div>
        <Label htmlFor="lead-subject">Предмет</Label>
        <select
          id="lead-subject"
          className="border-line-strong bg-surface text-ink mt-2 min-h-12 w-full rounded-md border px-4 text-base"
          aria-invalid={errors.subject ? true : undefined}
          {...register("subject")}
        >
          {SUBJECT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError id="lead-subject-error" message={errors.subject?.message} />
      </div>

      <div>
        <Label htmlFor="lead-message">Комментарий (необязательно)</Label>
        <Textarea
          id="lead-message"
          className="mt-2"
          placeholder="Класс, цель, что уже не получается"
          {...register("message")}
        />
        <FieldError id="lead-message-error" message={errors.message?.message} />
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            id="lead-consent"
            type="checkbox"
            className="accent-accent mt-1 size-5 shrink-0"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "lead-consent-error" : undefined}
            {...register("consent")}
          />
          <Label htmlFor="lead-consent" className="leading-snug font-normal">
            Согласен на обработку персональных данных для ответа на заявку.
          </Label>
        </div>
        <FieldError id="lead-consent-error" message={errors.consent?.message} />
      </div>

      {failure ? (
        <p
          role="alert"
          className="border-danger/40 bg-danger-soft text-danger flex items-start gap-2 rounded-md border px-4 py-3 text-sm"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{failure}</span>
        </p>
      ) : null}

      <Button type="submit" className="self-start" disabled={pending}>
        <Send aria-hidden className="size-4" />
        {pending ? "Отправляем…" : "Отправить заявку"}
      </Button>

      <p className="text-ink-faint text-sm">
        {channels.apiConfigured
          ? "Заявка уходит на сервер и не публикуется."
          : "Сообщение формируется на вашем устройстве и отправляется из вашего Telegram или почтового клиента."}
      </p>
    </form>
  );
}
