import { z } from "zod"

export const chatCreateResponseSchema = z.object({
  id: z.uuid(),
})

export const diagnosisResponseSchema = z.object({
  answer: z.string(),
})
