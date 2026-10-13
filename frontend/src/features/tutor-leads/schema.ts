import { z } from "zod";

export const TUTOR_LEAD_EXAMS = ["oge", "ege", "other"] as const;

export const tutorLeadSchema = z.object({
  contact: z
    .string()
    .trim()
    .min(3, "Оставьте Telegram, e‑mail или телефон для связи")
    .max(120, "Слишком длинный контакт"),
  exam: z.enum(TUTOR_LEAD_EXAMS, {
    message: "Выберите экзамен",
  }),
  name: z.string().trim().max(80, "Слишком длинное имя").optional(),
  subject: z.enum(["matematika", "informatika", "both"]).optional(),
  message: z.string().trim().max(1000, "Максимум 1000 символов").optional(),
  consent: z.boolean().refine((value) => value, {
    message: "Нужно согласие на обработку персональных данных",
  }),
});

export type TutorLeadFormValues = z.infer<typeof tutorLeadSchema>;
