import type { ChatListItemSchema } from "@/src/api/generated/models"

export interface ChatHistoryGroups {
  today: ChatListItemSchema[]
  earlier: ChatListItemSchema[]
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// «Сегодня» — по календарному дню пользователя, а не последние 24 часа
export function groupChatsByDay(
  items: ChatListItemSchema[],
  now: Date
): ChatHistoryGroups {
  const groups: ChatHistoryGroups = { today: [], earlier: [] }
  for (const item of items) {
    const lastMessageAt = new Date(item.last_message_at)
    const isToday =
      !Number.isNaN(lastMessageAt.getTime()) && isSameCalendarDay(lastMessageAt, now)
    groups[isToday ? "today" : "earlier"].push(item)
  }
  return groups
}
