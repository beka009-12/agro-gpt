import { describe, expect, test } from "bun:test"
import { mapHistoryMessage, parseHistoryResponse } from "./chat-history-mapping"

describe("mapHistoryMessage", () => {
  test("maps a text-only turn to a user message and a bot message", () => {
    const result = mapHistoryMessage({
      id: "m1",
      user_text: "Жёлтые листья",
      user_image: null,
      answer: "Похоже на нехватку азота",
      created_at: "2026-09-20T10:00:00Z",
    })

    expect(result).toEqual([
      { id: "m1-user", role: "user", text: "Жёлтые листья", imageUrl: undefined },
      { id: "m1-bot", role: "bot", text: "Похоже на нехватку азота" },
    ])
  })

  test("maps an image-only turn without a user text message losing the image", () => {
    const result = mapHistoryMessage({
      id: "m2",
      user_text: null,
      user_image: "https://cdn.example.com/leaf.jpg",
      answer: "Ржавчина",
      created_at: "2026-09-20T10:00:00Z",
    })

    expect(result[0]).toEqual({
      id: "m2-user",
      role: "user",
      text: "",
      imageUrl: "https://cdn.example.com/leaf.jpg",
    })
  })

  test("skips the user turn entirely when there is neither text nor image", () => {
    const result = mapHistoryMessage({
      id: "m3",
      user_text: null,
      user_image: null,
      answer: "Ответ",
      created_at: "2026-09-20T10:00:00Z",
    })

    expect(result).toHaveLength(1)
    expect(result[0].role).toBe("bot")
  })

  test("skips the bot turn when answer is null", () => {
    const result = mapHistoryMessage({
      id: "m4",
      user_text: "Вопрос без ответа",
      user_image: null,
      answer: null,
      created_at: "2026-09-20T10:00:00Z",
    })

    expect(result).toHaveLength(1)
    expect(result[0].role).toBe("user")
  })
})

describe("parseHistoryResponse", () => {
  test("accepts a well-formed response", () => {
    const result = parseHistoryResponse({
      messages: [
        {
          id: "m1",
          user_text: "test",
          user_image: null,
          answer: "ok",
          created_at: "2026-09-20T10:00:00Z",
        },
      ],
      has_more: false,
    })
    expect(result).not.toBeNull()
    expect(result?.has_more).toBe(false)
  })

  test("rejects a response missing has_more", () => {
    expect(parseHistoryResponse({ messages: [] })).toBeNull()
  })

  test("rejects a response where messages is not an array", () => {
    expect(parseHistoryResponse({ messages: "oops", has_more: false })).toBeNull()
  })

  test("rejects null and non-object input", () => {
    expect(parseHistoryResponse(null)).toBeNull()
    expect(parseHistoryResponse("oops")).toBeNull()
    expect(parseHistoryResponse(undefined)).toBeNull()
  })
})
