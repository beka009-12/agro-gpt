import { z } from "zod"
import type { Dictionary } from "@/src/i18n/dictionaries"

const PHONE_REGEX = /^\+?\d{9,15}$/

export function isPhoneLike(value: string): boolean {
  return PHONE_REGEX.test(value.trim())
}

export function splitIdentifier(value: string): { phone?: string; email?: string } {
  const trimmed = value.trim()
  return isPhoneLike(trimmed) ? { phone: trimmed } : { email: trimmed }
}

export function makeEmailField(e: Dictionary["auth"]["errors"]) {
  return z.string().trim().min(1, e.emailRequired).pipe(z.email(e.emailFormat))
}

export function makeRegisterFormSchema(dict: Dictionary) {
  const e = dict.auth.errors
  return z
    .object({
      full_name: z.string().trim().min(2, e.nameMin),
      email: makeEmailField(e),
      password: z.string().min(8, e.passwordMin),
      confirm_password: z.string().min(1, e.passwordRequired),
      language: z.enum(["ky", "ru", "en"]),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: e.passwordMismatch,
      path: ["confirm_password"],
    })
}

export type RegisterFormValues = z.infer<
  ReturnType<typeof makeRegisterFormSchema>
>

export function makeLoginFormSchema(dict: Dictionary) {
  const e = dict.auth.errors
  return z.object({
    email: makeEmailField(e),
    password: z.string().min(1, e.passwordRequired),
  })
}

export type LoginFormValues = z.infer<ReturnType<typeof makeLoginFormSchema>>

export function makeForgotPasswordFormSchema(dict: Dictionary) {
  return z.object({
    identifier: z.string().trim().min(1, dict.auth.errors.identifierRequired),
  })
}

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof makeForgotPasswordFormSchema>
>

export function makeResetPasswordFormSchema(dict: Dictionary) {
  const e = dict.auth.errors
  return z
    .object({
      identifier: z.string().trim().min(1, e.identifierRequired),
      reset_code: z.string().trim().min(1, e.resetCodeRequired),
      new_password: z.string().min(8, e.passwordMin),
      confirm_password: z.string().min(1, e.passwordRequired),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: e.passwordMismatch,
      path: ["confirm_password"],
    })
}

export type ResetPasswordFormValues = z.infer<
  ReturnType<typeof makeResetPasswordFormSchema>
>

// Ответ /api/auth/register и /api/auth/login не типизирован в OpenAPI —
// парсим защитно: обязателен только access_token
export const loginResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_at: z.string().optional(),
  full_name: z.string().optional(),
  language: z.string().optional(),
  user_id: z.string().optional(),
})
