"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

import { clientRequest } from "@/lib/api/client";
import { isPublicApiConfigured } from "@/lib/api/config";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { mailHref, siteConfig, telegramHref } from "@/lib/constants/site";

type SubjectValue = "math" | "informatics" | "both";

type Errors = {
  name?: string;
  contact?: string;
  consent?: string;
};

type Status = {
  kind: "ok" | "bad";
  message: string;
} | null;

const SUBJECT_MAP: Record<SubjectValue, "matematika" | "informatika" | "both"> = {
  math: "matematika",
  informatics: "informatika",
  both: "both",
};

function buildFallbackMessage(input: {
  name: string;
  contact: string;
  subject: SubjectValue;
  grade: string;
}): string {
  const subjectLabel =
    input.subject === "math"
      ? "Математика"
      : input.subject === "informatics"
        ? "Информатика"
        : "Математика и информатика";

  const lines = [
    "Заявка на занятия",
    "",
    `Имя: ${input.name}`,
    `Связь: ${input.contact}`,
    `Предмет: ${subjectLabel}`,
  ];
  if (input.grade) lines.push(`Класс: ${input.grade}`);
  return lines.join("\n");
}

export function LeadForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const startedRef = useRef(false);

  function markStarted(): void {
    if (startedRef.current) return;
    startedRef.current = true;
    track(ANALYTICS_EVENTS.leadFormStart);
  }

  function showStatus(kind: "ok" | "bad", message: string): void {
    setStatus({ kind, message });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const contact = String(data.get("contact") ?? "").trim();
    const subject = (String(data.get("subject") ?? "math") as SubjectValue) || "math";
    const grade = String(data.get("grade") ?? "");
    const website = String(data.get("website") ?? "");
    const consent = data.get("consent") === "on";

    const digits = contact.replace(/\D/g, "");
    const isPhone =
      /^[+\d\s()\-]+$/.test(contact) && digits.length >= 10 && digits.length <= 15;
    const isTelegram = /^@?[A-Za-z][A-Za-z0-9_]{4,31}$/.test(contact);

    const nextErrors: Errors = {};
    if (name.length < 2) nextErrors.name = "Укажите имя";
    if (!contact) nextErrors.contact = "Укажите телефон или Telegram";
    else if (!isPhone && !isTelegram) {
      nextErrors.contact = "Проверьте формат: +7 900 000-00-00 или @username";
    }
    if (!consent) nextErrors.consent = "Нужно согласие на обработку данных";

    setErrors(nextErrors);
    setStatus(null);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.name) nameRef.current?.focus();
      else if (nextErrors.contact) contactRef.current?.focus();
      else consentRef.current?.focus();
      return;
    }

    setBusy(true);
    setSent(false);

    try {
      if (isPublicApiConfigured()) {
        await clientRequest<void>("/tutor-leads", {
          method: "POST",
          body: {
            name,
            contact,
            exam: "other",
            subject: SUBJECT_MAP[subject],
            message: grade ? `Класс: ${grade}` : undefined,
            consent: true,
            website: website || undefined,
          },
        });
        showStatus("ok", "Заявка отправлена. Спасибо, свяжемся с вами.");
        track(ANALYTICS_EVENTS.leadFormSubmit, { channel: "api" });
        form.reset();
        setSent(true);
        return;
      }

      const text = buildFallbackMessage({ name, contact, subject, grade });
      const telegram = telegramHref(siteConfig.tutor.telegram);
      const email = mailHref(siteConfig.tutor.email);

      if (telegram) {
        window.open(
          `${telegram}?text=${encodeURIComponent(text)}`,
          "_blank",
          "noopener,noreferrer",
        );
        showStatus("ok", "Открываю Telegram с готовым сообщением.");
        track(ANALYTICS_EVENTS.leadFormSubmit, { channel: "telegram" });
        setSent(true);
        return;
      }

      if (email) {
        window.open(
          `${email}?subject=${encodeURIComponent("Заявка на занятия")}&body=${encodeURIComponent(text)}`,
          "_blank",
          "noopener,noreferrer",
        );
        showStatus("ok", "Открываю почтовый клиент с готовым письмом.");
        track(ANALYTICS_EVENTS.leadFormSubmit, { channel: "email" });
        setSent(true);
        return;
      }

      showStatus(
        "bad",
        "Форма пока не подключена к серверу — заявка не отправлена. Подключите адрес API заявок.",
      );
    } catch {
      showStatus(
        "bad",
        "Не удалось отправить заявку. Проверьте данные и соединение и попробуйте ещё раз.",
      );
      track(ANALYTICS_EVENTS.leadFormError, { stage: "submit" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      id="form"
      className="f"
      noValidate
      data-r
      data-lead-form=""
      aria-label="Заявка на занятия"
      onSubmit={handleSubmit}
      onFocusCapture={markStarted}
    >
      <div>
        <label htmlFor="name">Имя</label>
        <input
          ref={nameRef}
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Как к вам обращаться"
          aria-describedby="e-name"
          aria-invalid={errors.name ? true : undefined}
        />
        <p className="err" id="e-name" role="alert">
          {errors.name ?? ""}
        </p>
      </div>

      <fieldset>
        <legend>Предмет</legend>
        <div className="seg">
          <input type="radio" name="subject" id="s1" value="math" defaultChecked />
          <label htmlFor="s1">Математика</label>
          <input type="radio" name="subject" id="s2" value="informatics" />
          <label htmlFor="s2">Информатика</label>
          <input type="radio" name="subject" id="s3" value="both" />
          <label htmlFor="s3">Оба</label>
        </div>
      </fieldset>

      <div className="row">
        <div>
          <label htmlFor="grade">Класс (по желанию)</label>
          <select id="grade" name="grade" defaultValue="">
            <option value="">Не указан</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
          </select>
        </div>
        <div>
          <label htmlFor="contact">Телефон или Telegram</label>
          <input
            ref={contactRef}
            id="contact"
            name="contact"
            type="text"
            autoComplete="tel"
            placeholder="+7 900 000-00-00 или @username"
            aria-describedby="e-contact"
            aria-invalid={errors.contact ? true : undefined}
          />
          <p className="err" id="e-contact" role="alert">
            {errors.contact ?? ""}
          </p>
        </div>
      </div>

      <div className="hp" aria-hidden="true">
        <label>
          Сайт
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label className="consent">
          <input
            ref={consentRef}
            type="checkbox"
            id="consent"
            name="consent"
            aria-describedby="e-consent"
            aria-invalid={errors.consent ? true : undefined}
          />
          <span>
            Согласен на обработку персональных данных.{" "}
            <Link href="/privacy" target="_blank" rel="noopener">
              Политика конфиденциальности
            </Link>
          </span>
        </label>
        <p className="err" id="e-consent" role="alert">
          {errors.consent ?? ""}
        </p>
      </div>

      <button className={`btn${busy ? "load" : ""}`} type="submit" disabled={busy}>
        <span className="sp" aria-hidden="true" />
        <span>
          {busy ? "Отправляем…" : sent ? "Заявка отправлена" : "Обсудить занятия"}
        </span>
      </button>

      <div className={`status ${status?.kind ?? ""}`} role="status" aria-live="polite">
        {status?.message ?? ""}
      </div>
    </form>
  );
}
