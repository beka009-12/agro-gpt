import { z } from "zod"
import type {
  ChatListItemSchema,
  ChatMessageSchema,
  ChatOutSchema,
  DiagnosisResponseSchema,
} from "@/src/api/generated/models"

export const chatCreateResponseSchema: z.ZodType<
  Pick<ChatOutSchema, "id">
> = z.object({
  id: z.uuid(),
})

export const chatIdSchema = z.uuid()

export const diagnosisResponseSchema: z.ZodType<
  Pick<DiagnosisResponseSchema, "answer">
> = z.object({
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

export const chatListItemSchema: z.ZodType<ChatListItemSchema> = z.object({
  id: z.uuid(),
  title: z.string().nullable(),
  created_at: z.string(),
  last_message_at: z.string(),
  messages_count: z.number(),
  purge_at: z.string().nullable().optional(),
})

export const chatMessageSchema: z.ZodType<ChatMessageSchema> = z.object({
  id: z.uuid(),
  user_text: z.string().nullable(),
  user_image: z.string().nullable(),
  answer: z.string().nullable(),
  crop: z.string().optional(),
  disease_name: z.string().optional(),
  created_at: z.string(),
})

export const chatMessagesResponseSchema = z.object({
  messages: z.array(chatMessageSchema),
  has_more: z.boolean(),
})

export const chatRenameFormSchema = z.object({
  title: z.string().trim().min(1).max(200),
})
