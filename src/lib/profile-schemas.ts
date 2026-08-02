import { z } from "zod"
import type { Dictionary } from "@/src/i18n/dictionaries"
import { makeEmailField } from "@/src/lib/auth-schemas"

export const userProfileSchema = z.object({
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

export type UserProfile = z.infer<typeof userProfileSchema>

export function makeProfileFormSchema(dict: Dictionary) {
  const e = dict.auth.errors
  return z.object({
    full_name: z.string().trim().min(2, e.nameMin),
    email: makeEmailField(e),
  })
}

export type ProfileFormValues = z.infer<
  ReturnType<typeof makeProfileFormSchema>
>

export const locationDtoSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})
