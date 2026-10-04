import { describe, expect, test } from "bun:test"
import type { ChatListItemSchema } from "@/src/api/generated/models"
import { groupChatsByDay } from "./chat-history-groups"

const NOW = new Date(2026, 9, 5, 18, 0)

function chat(id: string, lastMessageAt: Date): ChatListItemSchema {
  return {
    id,
    title: id,
    created_at: lastMessageAt.toISOString(),
    last_message_at: lastMessageAt.toISOString(),
    messages_count: 1,
  }
}

describe("groupChatsByDay", () => {
  test("splits chats into today and earlier, keeping their order", () => {
    const items = [
      chat("a", new Date(2026, 9, 5, 17, 0)),
      chat("b", new Date(2026, 9, 5, 9, 30)),
      chat("c", new Date(2026, 9, 4, 23, 50)),
      chat("d", new Date(2026, 8, 1, 12, 0)),
    ]

    const groups = groupChatsByDay(items, NOW)

    expect(groups.today.map((item) => item.id)).toEqual(["a", "b"])
    expect(groups.earlier.map((item) => item.id)).toEqual(["c", "d"])
  })

  test("uses the calendar day, so just after midnight yesterday is earlier", () => {
    const justAfterMidnight = new Date(2026, 9, 5, 0, 10)
    const groups = groupChatsByDay(
      [chat("late", new Date(2026, 9, 4, 23, 59))],
      justAfterMidnight
    )

    expect(groups.today).toEqual([])
    expect(groups.earlier.map((item) => item.id)).toEqual(["late"])
  })

  test("puts chats with an unparsable date into earlier", () => {
    const broken = { ...chat("x", NOW), last_message_at: "not-a-date" }

    expect(groupChatsByDay([broken], NOW).earlier.map((item) => item.id)).toEqual(["x"])
  })
})
