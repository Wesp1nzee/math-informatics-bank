import { z } from "zod";

import {
  CONTACT_FORMAT_MESSAGE,
  CONTACT_MAX_LENGTH,
  isValidContact,
} from "@/lib/utils/contact";

export const TUTOR_LEAD_EXAMS = ["oge", "ege", "other"] as const;

export const tutorLeadSchema = z.object({
  contact: z
    .string()
    .trim()
    .min(1, "Оставьте Telegram, e‑mail или телефон для связи")
    .max(CONTACT_MAX_LENGTH, "Слишком длинный контакт")
    .refine(isValidContact, CONTACT_FORMAT_MESSAGE),
  exam: z.enum(TUTOR_LEAD_EXAMS, {
    message: "Выберите экзамен",
  }),
  name: z.string().trim().max(80, "Слишком длинное имя").optional(),
  subject: z.enum(["matematika", "informatika", "both"]).optional(),
  message: z.string().trim().max(1000, "Максимум 1000 символов").optional(),
  website: z.string().max(256, "Слишком длинное значение").optional(),
  consent: z.boolean().refine((value) => value, {
    message: "Нужно согласие на обработку персональных данных",
  }),
});

export type TutorLeadFormValues = z.infer<typeof tutorLeadSchema>;
