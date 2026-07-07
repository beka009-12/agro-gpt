import { z } from "zod"
import ru from "@/src/i18n/ru.json"

const PHONE_REGEX = /^\+?\d{9,15}$/

export const registerFormSchema = z.object({
  full_name: z.string().trim().min(2, ru.auth.errors.nameMin),
  phone: z.string().trim().regex(PHONE_REGEX, ru.auth.errors.phoneFormat),
  email: z.union([z.email(ru.auth.errors.emailFormat), z.literal("")]),
  region: z.string().trim(),
  language: z.enum(["ky", "ru", "en"]),
})

export type RegisterFormValues = z.infer<typeof registerFormSchema>

export const emailFormSchema = z.object({
  email: z.email(ru.auth.errors.emailFormat),
})

export type EmailFormValues = z.infer<typeof emailFormSchema>

export const otpFormSchema = z.object({
  otp_code: z.string().trim().regex(/^\d{4,8}$/, ru.auth.errors.otpFormat),
})

export type OtpFormValues = z.infer<typeof otpFormSchema>

export const otpVerifyDtoSchema = z.object({
  email: z.email(),
  otp_code: z.string().min(1),
})

// Ответ POST /user/ не типизирован в OpenAPI — парсим защитно:
// обязателен только access_token, остальное добираем из данных формы
export const loginResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_at: z.string().optional(),
  full_name: z.string().optional(),
  language: z.string().optional(),
})
