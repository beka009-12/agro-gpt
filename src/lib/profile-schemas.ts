import { z } from "zod"
import type { Dictionary } from "@/src/i18n/dictionaries"
import { makeEmailField } from "@/src/lib/auth-schemas"

export const userProfileSchema = z.object({
  id: z.string(),
  full_name: z.string(),
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
