import { z } from "zod"

export const chatCreateResponseSchema = z.object({
  id: z.uuid(),
})

export const chatIdSchema = z.uuid()

export const diagnosisResponseSchema = z.object({
  answer: z.string(),
})

// z.string() первым звеном — чтобы File из формы и пустая строка не прошли:
// голый z.coerce.number() превратил бы "" в 0, а это валидная точка 0,0
const coordField = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .transform(Number)
    .pipe(z.number().min(min).max(max))

export const chatCoordsSchema = z.object({
  latitude: coordField(-90, 90),
  longitude: coordField(-180, 180),
})
