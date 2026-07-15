import { z } from "zod"
import type { Dictionary } from "@/src/i18n/dictionaries"

const PHONE_REGEX = /^\+?\d{9,15}$/

export const userProfileSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  language: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  location_available: z.boolean().default(false),
})

export type UserProfile = z.infer<typeof userProfileSchema>

export function makeProfileFormSchema(dict: Dictionary) {
  const e = dict.auth.errors
  return z.object({
    full_name: z.string().trim().min(2, e.nameMin),
    phone: z.string().trim().regex(PHONE_REGEX, e.phoneFormat),
    email: z.union([z.email(e.emailFormat), z.literal("")]),
  })
}

export type ProfileFormValues = z.infer<
  ReturnType<typeof makeProfileFormSchema>
>

export const locationDtoSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})
