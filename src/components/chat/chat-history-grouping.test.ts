import { describe, expect, test } from "bun:test"
import { groupChatsByDate } from "./chat-history-grouping"
import type { ChatListItemSchema } from "@/src/api/generated/models"

function chat(id: string, lastMessageAt: string): ChatListItemSchema {
  return {
    id,
    title: `chat-${id}`,
    created_at: lastMessageAt,
    last_message_at: lastMessageAt,
    messages_count: 1,
  }
}

describe("groupChatsByDate", () => {
  const now = new Date("2026-09-29T12:00:00")

  test("buckets today, yesterday, last7Days, and older correctly", () => {
    const items = [
      chat("today-chat", "2026-09-29T08:00:00"),
      chat("yesterday-chat", "2026-09-28T08:00:00"),
      chat("week-chat", "2026-09-24T08:00:00"),
      chat("old-chat", "2026-09-01T08:00:00"),
    ]

    const groups = groupChatsByDate(items, now)

    expect(groups).toEqual([
      { key: "today", items: [items[0]] },
      { key: "yesterday", items: [items[1]] },
      { key: "last7Days", items: [items[2]] },
      { key: "older", items: [items[3]] },
    ])
  })

  test("omits empty groups", () => {
    const items = [chat("today-chat", "2026-09-29T08:00:00")]
    const groups = groupChatsByDate(items, now)
    expect(groups).toEqual([{ key: "today", items }])
  })

  test("returns an empty array for no chats", () => {
    expect(groupChatsByDate([], now)).toEqual([])
  })

  test("treats exactly 7 days ago as last7Days, and 8 days ago as older", () => {
    const items = [
      chat("seven-days", "2026-09-22T08:00:00"),
      chat("eight-days", "2026-09-21T08:00:00"),
    ]
    const groups = groupChatsByDate(items, now)
    expect(groups).toEqual([
      { key: "last7Days", items: [items[0]] },
      { key: "older", items: [items[1]] },
    ])
  })
})
