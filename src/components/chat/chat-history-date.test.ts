import { describe, expect, test } from "bun:test"
import { formatChatDate } from "./chat-history-date"

const LABELS = { today: "Сегодня", yesterday: "Вчера" }
const NOW = new Date(2026, 9, 4, 18, 0)

function iso(...args: [number, number, number, number, number]): string {
  return new Date(...args).toISOString()
}

describe("formatChatDate", () => {
  test("shows time for today's chats", () => {
    expect(formatChatDate(iso(2026, 9, 4, 14, 20), NOW, "ru", LABELS)).toBe(
      "Сегодня, 14:20"
    )
  })

  test("shows time for yesterday's chats", () => {
    expect(formatChatDate(iso(2026, 9, 3, 9, 5), NOW, "ru", LABELS)).toBe(
      "Вчера, 09:05"
    )
  })

  test("treats a just-midnight boundary by calendar day, not 24 hours", () => {
    const earlyMorning = new Date(2026, 9, 4, 0, 30)
    expect(formatChatDate(iso(2026, 9, 3, 23, 50), earlyMorning, "ru", LABELS)).toBe(
      "Вчера, 23:50"
    )
  })

  test("shows day and month for older chats this year", () => {
    expect(formatChatDate(iso(2026, 8, 28, 10, 0), NOW, "ru", LABELS)).toBe(
      "28 сент."
    )
  })

  test("adds the year for chats from previous years", () => {
    expect(formatChatDate(iso(2025, 11, 30, 10, 0), NOW, "ru", LABELS)).toBe(
      "30 дек. 2025 г."
    )
  })

  test("formats in the UI locale", () => {
    expect(formatChatDate(iso(2026, 8, 28, 10, 0), NOW, "en", LABELS)).toBe(
      "Sep 28"
    )
  })

  test("returns an empty string for an invalid date", () => {
    expect(formatChatDate("not-a-date", NOW, "ru", LABELS)).toBe("")
  })
})
