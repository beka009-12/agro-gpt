import { describe, expect, test } from "bun:test"
import {
  chatIdSchema,
  chatListItemSchema,
  chatMessageSchema,
  chatMessagesResponseSchema,
  chatRenameFormSchema,
} from "./chat-schemas"

describe("chatIdSchema", () => {
  test("accepts a valid uuid", () => {
    expect(chatIdSchema.safeParse("3fa85f64-5717-4562-b3fc-2c963f66afa6").success).toBe(true)
  })

  test("rejects a non-uuid string", () => {
    expect(chatIdSchema.safeParse("not-a-uuid").success).toBe(false)
  })
})

describe("chatListItemSchema", () => {
  test("accepts a chat with a null title and purge_at", () => {
    const result = chatListItemSchema.safeParse({
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      title: null,
      created_at: "2026-09-01T10:00:00Z",
      last_message_at: "2026-09-20T10:00:00Z",
      messages_count: 3,
      purge_at: "2026-09-23T10:00:00Z",
    })
    expect(result.success).toBe(true)
  })

  test("accepts a chat without purge_at", () => {
    const result = chatListItemSchema.safeParse({
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      title: "Помидоры",
      created_at: "2026-09-01T10:00:00Z",
      last_message_at: "2026-09-20T10:00:00Z",
      messages_count: 3,
    })
    expect(result.success).toBe(true)
  })

  test("rejects a chat missing created_at", () => {
    const result = chatListItemSchema.safeParse({
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      title: "Помидоры",
      last_message_at: "2026-09-20T10:00:00Z",
      messages_count: 3,
    })
    expect(result.success).toBe(false)
  })
})

describe("chatMessagesResponseSchema", () => {
  test("accepts a page of messages with has_more", () => {
    const result = chatMessagesResponseSchema.safeParse({
      messages: [
        {
          id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          user_text: "Жёлтые листья",
          user_image: null,
          answer: "Похоже на нехватку азота",
          created_at: "2026-09-20T10:00:00Z",
        },
      ],
      has_more: true,
    })
    expect(result.success).toBe(true)
  })

  test("rejects a response without has_more", () => {
    const result = chatMessagesResponseSchema.safeParse({ messages: [] })
    expect(result.success).toBe(false)
  })
})

describe("chatMessageSchema", () => {
  test("accepts optional crop and disease_name", () => {
    const result = chatMessageSchema.safeParse({
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      user_text: null,
      user_image: "https://cdn.example.com/leaf.jpg",
      answer: "Ржавчина пшеницы",
      crop: "wheat",
      disease_name: "rust",
      created_at: "2026-09-20T10:00:00Z",
    })
    expect(result.success).toBe(true)
  })
})

describe("chatRenameFormSchema", () => {
  test("rejects an empty title", () => {
    expect(chatRenameFormSchema.safeParse({ title: "" }).success).toBe(false)
  })

  test("rejects a whitespace-only title", () => {
    expect(chatRenameFormSchema.safeParse({ title: "   " }).success).toBe(false)
  })

  test("trims and accepts a valid title", () => {
    const result = chatRenameFormSchema.safeParse({ title: "  Томаты  " })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.title).toBe("Томаты")
  })

  test("rejects a title over 200 characters", () => {
    expect(chatRenameFormSchema.safeParse({ title: "a".repeat(201) }).success).toBe(false)
  })
})
