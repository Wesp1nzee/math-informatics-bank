import { z } from "zod";

export const tutorLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Укажите имя — минимум 2 символа")
    .max(80, "Слишком длинное имя"),
  contact: z
    .string()
    .trim()
    .min(3, "Оставьте Telegram, e‑mail или телефон для связи")
    .max(120, "Слишком длинный контакт"),
  subject: z.enum(["matematika", "informatika", "both"], {
    message: "Выберите предмет",
  }),
  message: z.string().trim().max(1000, "Максимум 1000 символов").optional(),
  // `refine` keeps the form value a plain boolean (an unchecked checkbox must
  // be representable) while still guaranteeing `true` after validation.
  consent: z.boolean().refine((value) => value, {
    message: "Нужно согласие на обработку персональных данных",
  }),
});

export type TutorLeadFormValues = z.infer<typeof tutorLeadSchema>;
