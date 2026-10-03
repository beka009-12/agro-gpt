import { describe, expect, test } from "bun:test"
import { groupChatsByTopic, splitChatTitle } from "./chat-history-grouping"
import type { ChatListItemSchema } from "@/src/api/generated/models"

function chat(id: string, title: string | null, lastMessageAt: string): ChatListItemSchema {
  return {
    id,
    title,
    created_at: lastMessageAt,
    last_message_at: lastMessageAt,
    messages_count: 1,
  }
}

describe("splitChatTitle", () => {
  test("splits crop and problem on hyphen and dashes", () => {
    expect(splitChatTitle("Томат - дефицит фосфора")).toEqual({
      topic: "Томат",
      rest: "дефицит фосфора",
    })
    expect(splitChatTitle("Пшеница — бурая ржавчина")).toEqual({
      topic: "Пшеница",
      rest: "бурая ржавчина",
    })
  })

  test("returns null for titles without a topic", () => {
    expect(splitChatTitle(null)).toBeNull()
    expect(splitChatTitle("Мой огород")).toBeNull()
    expect(splitChatTitle("Сорт-гибрид")).toBeNull()
    expect(splitChatTitle(" - пусто")).toBeNull()
  })
})

describe("groupChatsByTopic", () => {
  test("groups by crop case-insensitively with newest groups first", () => {
    const items = [
      chat("t1", "Томат - дефицит фосфора", "2026-09-20T08:00:00Z"),
      chat("w1", "Пшеница - бурая ржавчина", "2026-09-28T08:00:00Z"),
      chat("t2", "томат - фитофтороз", "2026-09-29T08:00:00Z"),
    ]

    const groups = groupChatsByTopic(items)

    expect(groups.map((group) => group.topic)).toEqual(["Томат", "Пшеница"])
    expect(groups[0].items.map((item) => [item.chat.id, item.label])).toEqual([
      ["t2", "Фитофтороз"],
      ["t1", "Дефицит фосфора"],
    ])
  })

  test("puts untitled and free-form chats into a trailing other group", () => {
    const items = [
      chat("free", "Мой огород", "2026-09-29T10:00:00Z"),
      chat("none", null, "2026-09-29T09:00:00Z"),
      chat("t1", "Томат - фитофтороз", "2026-09-01T08:00:00Z"),
    ]

    const groups = groupChatsByTopic(items)

    expect(groups.map((group) => group.topic)).toEqual(["Томат", null])
    expect(groups[1].items.map((item) => [item.chat.id, item.label])).toEqual([
      ["free", "Мой огород"],
      ["none", null],
    ])
  })

  test("returns no groups for an empty list", () => {
    expect(groupChatsByTopic([])).toEqual([])
  })
})
