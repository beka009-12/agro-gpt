import { z } from "zod"
import type { Dictionary } from "@/src/i18n/dictionaries"

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
  return z.object({ email: makeEmailField(dict.auth.errors) })
}

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof makeForgotPasswordFormSchema>
>

export function makeResetPasswordFormSchema(dict: Dictionary) {
  const e = dict.auth.errors
  return z
    .object({
      email: makeEmailField(e),
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

// Backend пока не публикует response_model для auth в OpenAPI,
// поэтому фактический ответ валидируем вручную.
const authUserSchema = z.object({
  id: z.uuid(),
  full_name: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  language: z.enum(["ky", "ru", "en"]),
  is_active: z.boolean(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const loginResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.literal("bearer"),
  expires_at: z.string(),
  user: authUserSchema,
})
