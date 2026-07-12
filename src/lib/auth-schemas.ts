import { z } from "zod"
import type { Dictionary } from "@/src/i18n/dictionaries"

const PHONE_REGEX = /^\+?\d{9,15}$/

export function makeRegisterFormSchema(dict: Dictionary) {
  const e = dict.auth.errors
  return z.object({
    full_name: z.string().trim().min(2, e.nameMin),
    phone: z.string().trim().regex(PHONE_REGEX, e.phoneFormat),
    email: z.union([z.email(e.emailFormat), z.literal("")]),
    region: z.string().trim(),
    language: z.enum(["ky", "ru", "en"]),
  })
}

export type RegisterFormValues = z.infer<
  ReturnType<typeof makeRegisterFormSchema>
>

export function makeEmailFormSchema(dict: Dictionary) {
  return z.object({
    email: z.email(dict.auth.errors.emailFormat),
  })
}

export type EmailFormValues = z.infer<ReturnType<typeof makeEmailFormSchema>>

export function makeOtpFormSchema(dict: Dictionary) {
  return z.object({
    otp_code: z.string().trim().regex(/^\d{4,8}$/, dict.auth.errors.otpFormat),
  })
}

export type OtpFormValues = z.infer<ReturnType<typeof makeOtpFormSchema>>

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
  user_id: z.string().optional(),
})
