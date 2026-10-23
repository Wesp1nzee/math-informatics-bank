"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CircleAlert, Send, SendHorizontal, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitTutorLead } from "@/features/tutor-leads/api";
import {
  buildLeadTelegramHref,
  EXAM_OPTIONS,
  SUBJECT_OPTIONS,
} from "@/features/tutor-leads/content";
import {
  tutorLeadSchema,
  type TutorLeadFormValues,
} from "@/features/tutor-leads/schema";
import type {
  ContactChannels,
  TutorLeadDelivery,
  TutorLeadExam,
  TutorLeadInput,
  TutorLeadSubject,
} from "@/features/tutor-leads/types";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { describeApiError } from "@/lib/api/errors";
import { isValidContact } from "@/lib/utils/contact";
import { cn } from "@/lib/utils/cn";
import { pulseWorld } from "@/features/world/bus";

const DELIVERY_MESSAGE: Record<TutorLeadDelivery, string> = {
  api: "Заявка отправлена. Свяжусь с вами, чтобы договориться о времени.",
  telegram: "Открываю Telegram с готовым сообщением — останется нажать «Отправить».",
  email: "Открываю почтовый клиент с готовым письмом — останется нажать «Отправить».",
};

export type LeadProgressState = {
  percent: number;
  contact: string;
  contactReady: boolean;
  consent: boolean;
  exam: TutorLeadExam;
  subject: TutorLeadSubject;
  name: string;
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-danger form-error mt-1.5 text-sm">
      {message}
    </p>
  );
}

function toInput(values: TutorLeadFormValues): TutorLeadInput {
  return {
    name: values.name?.trim() || undefined,
    contact: values.contact,
    exam: values.exam,
    subject: values.subject,
    message: values.message,
    website: values.website || undefined,
    consent: true,
  };
}

export function TutorLeadForm({
  channels,
  onProgress,
  onSent,
  onReset,
}: {
  channels: ContactChannels;
  onProgress?: (state: LeadProgressState) => void;
  onSent?: () => void;
  onReset?: () => void;
}) {
  const uid = useId();
  const [delivery, setDelivery] = useState<TutorLeadDelivery | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const startedRef = useRef(false);

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TutorLeadFormValues>({
    resolver: zodResolver(tutorLeadSchema),
    defaultValues: {
      contact: "",
      exam: "ege",
      name: "",
      subject: "both",
      message: "",
      website: "",
      consent: false,
    },
  });

  const [snapshot, setSnapshot] = useState<LeadProgressState>({
    percent: 0,
    contact: "",
    contactReady: false,
    consent: false,
    exam: "ege",
    subject: "both",
    name: "",
  });
  const [messageValue, setMessageValue] = useState("");

  const contactValue = snapshot.contact;
  const contactReady = isValidContact(contactValue);
  const exam = snapshot.exam;
  const subject = snapshot.subject;
  const consent = snapshot.consent;
  const nameValue = snapshot.name;
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  function syncSnapshot() {
    const current = getValues();
    setSnapshot({
      percent: 0,
      contact: current.contact ?? "",
      contactReady: isValidContact(current.contact ?? ""),
      consent: current.consent === true,
      exam: (current.exam ?? "ege") as TutorLeadExam,
      subject: (current.subject ?? "both") as TutorLeadSubject,
      name: current.name ?? "",
    });
    setMessageValue(current.message ?? "");
  }

  useEffect(() => {
    const contact = contactValue.trim();
    const details = Boolean(nameValue.trim() || messageValue.trim());
    let percent = 0;
    if (contact.length > 0) percent = 34;
    if (contactReady && consent) percent = 67;
    if (contactReady && consent && details) percent = 100;
    onProgressRef.current?.({
      percent,
      contact,
      contactReady,
      consent,
      exam,
      subject,
      name: nameValue.trim(),
    });
  }, [contactReady, contactValue, consent, exam, messageValue, nameValue, subject]);

  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    track(ANALYTICS_EVENTS.leadFormStart);
  }

  const onSubmit = handleSubmit(async (formValues) => {
    setPending(true);
    setFailure(null);
    try {
      const result = await submitTutorLead(toInput(formValues), channels);
      setDelivery(result);
      track(ANALYTICS_EVENTS.leadFormSubmit, { channel: result });
      pulseWorld("ok");
      onSent?.();
      reset();
    } catch (error) {
      setFailure(describeApiError(error));
      track(ANALYTICS_EVENTS.leadFormError, { stage: "submit" });
    } finally {
      setPending(false);
    }
  });

  function openTelegram() {
    if (!channels.telegramHref) return;
    markStarted();
    window.open(
      buildLeadTelegramHref(channels.telegramHref, toInput(getValues())),
      "_blank",
      "noopener,noreferrer",
    );
    track(ANALYTICS_EVENTS.leadFormSubmit, { channel: "telegram" });
  }

  if (delivery) {
    return (
      <div
        role="status"
        data-lead-form=""
        className="border-success/40 bg-success-soft shadow-card relative overflow-hidden rounded-xl border p-6 md:p-8"
      >
        <span className="success-crystal mb-4" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        <p className="text-ink text-lg font-medium">
          {delivery === "api" ? "Заявка отправлена" : "Сообщение готово"}
        </p>
        <p className="text-ink-soft mt-2">{DELIVERY_MESSAGE[delivery]}</p>
        <ul className="text-ink-soft m-0 mt-4 list-none space-y-2 p-0">
          <li className="flex items-start gap-2">
            <Check aria-hidden className="text-success mt-0.5 size-4 shrink-0" />
            Свяжусь с вами и договоримся о времени.
          </li>
          <li className="flex items-start gap-2">
            <Check aria-hidden className="text-success mt-0.5 size-4 shrink-0" />
            На пробном начнём с диагностики.
          </li>
          <li className="flex items-start gap-2">
            <Sparkles aria-hidden className="text-accent mt-0.5 size-4 shrink-0" />
            Пришлю короткий план по итогам разбора.
          </li>
        </ul>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-5"
          onClick={() => {
            setDelivery(null);
            onReset?.();
          }}
        >
          Отправить ещё одну
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      onFocusCapture={markStarted}
      onChange={syncSnapshot}
      noValidate
      data-lead-form=""
      className="lead-form border-line bg-surface shadow-card flex flex-col gap-5 rounded-2xl border p-5 md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-ink-soft m-0 text-sm">
          Достаточно контакта и экзамена — остальное можно не заполнять.
        </p>
        <span className="mono-label">
          FORM / 0{contactReady ? "3" : consent ? "2" : "1"}
        </span>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-auto -left-[9999px] h-px w-px overflow-hidden"
      >
        <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div>
        <Label htmlFor={`${uid}-contact`}>Как с вами связаться</Label>
        <div className="field-shell relative">
          <Input
            id={`${uid}-contact`}
            className={cn("mt-2", contactReady && "border-success pr-11")}
            autoComplete="email"
            placeholder="Telegram, e‑mail или телефон"
            aria-invalid={errors.contact ? true : undefined}
            aria-describedby={errors.contact ? `${uid}-contact-error` : undefined}
            {...register("contact")}
          />
          {contactReady ? (
            <span className="field-valid" aria-hidden="true">
              <Check className="size-3" />
            </span>
          ) : null}
        </div>
        <FieldError id={`${uid}-contact-error`} message={errors.contact?.message} />
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className="text-ink mb-2 text-sm font-medium">Экзамен</legend>
        <div className="choice-row" role="group" aria-label="Экзамен">
          {EXAM_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className="choice-chip"
              data-active={exam === option.value ? "" : undefined}
              aria-pressed={exam === option.value}
              onClick={() => {
                setValue("exam", option.value, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                syncSnapshot();
                markStarted();
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
        <select
          id={`${uid}-exam`}
          className="sr-only"
          aria-label="Экзамен"
          aria-invalid={errors.exam ? true : undefined}
          {...register("exam")}
        >
          {EXAM_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError id={`${uid}-exam-error`} message={errors.exam?.message} />
      </fieldset>

      <details className="group border-line rounded-lg border px-4 py-3">
        <summary className="text-ink flex min-h-9 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          Добавить детали (необязательно)
          <span className="mono-label">DETAILS</span>
        </summary>
        <div className="mt-4 flex flex-col gap-5">
          <div>
            <Label htmlFor={`${uid}-name`}>Имя</Label>
            <div className="field-shell relative">
              <Input
                id={`${uid}-name`}
                className="mt-2"
                autoComplete="name"
                {...register("name")}
              />
            </div>
            <FieldError id={`${uid}-name-error`} message={errors.name?.message} />
          </div>

          <fieldset className="m-0 border-0 p-0">
            <legend className="text-ink mb-2 text-sm font-medium">Предмет</legend>
            <div className="choice-row" role="group" aria-label="Предмет">
              {SUBJECT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="choice-chip"
                  data-active={subject === option.value ? "" : undefined}
                  aria-pressed={subject === option.value}
                  onClick={() => {
                    setValue("subject", option.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    syncSnapshot();
                    markStarted();
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <select
              id={`${uid}-subject`}
              className="sr-only"
              aria-label="Предмет"
              {...register("subject")}
            >
              {SUBJECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </fieldset>

          <div>
            <Label htmlFor={`${uid}-message`}>Комментарий</Label>
            <div className="field-shell relative">
              <Textarea
                id={`${uid}-message`}
                className="mt-2"
                placeholder="Класс, цель, что уже не получается"
                {...register("message")}
              />
            </div>
            <FieldError id={`${uid}-message-error`} message={errors.message?.message} />
          </div>
        </div>
      </details>

      <div>
        <div className="flex items-start gap-3">
          <input
            id={`${uid}-consent`}
            type="checkbox"
            className="accent-accent mt-1 size-5 shrink-0"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${uid}-consent-error` : undefined}
            {...register("consent")}
          />
          <Label htmlFor={`${uid}-consent`} className="leading-snug font-normal">
            Согласен на обработку персональных данных для ответа на заявку.{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Политика обработки данных
            </Link>
          </Label>
        </div>
        <FieldError id={`${uid}-consent-error`} message={errors.consent?.message} />
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

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending} className="cta-glow">
          <Send aria-hidden className="size-4" />
          {pending ? "Отправляем…" : "Отправить заявку"}
        </Button>

        {channels.telegramHref ? (
          <Button type="button" variant="secondary" onClick={openTelegram}>
            <SendHorizontal aria-hidden className="size-4" />
            Написать в Telegram
          </Button>
        ) : null}
      </div>

      <p className="text-ink-faint m-0 text-sm">
        {channels.apiConfigured
          ? "Заявка уходит на сервер и не публикуется."
          : "Сообщение формируется на вашем устройстве и отправляется из вашего Telegram или почтового клиента."}
      </p>
    </form>
  );
}
