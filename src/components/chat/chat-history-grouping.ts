import type { ChatListItemSchema } from "@/src/api/generated/models"

export type ChatGroupKey = "today" | "yesterday" | "last7Days" | "older"

export interface ChatGroup {
  key: ChatGroupKey
  items: ChatListItemSchema[]
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function groupChatsByDate(
  items: ChatListItemSchema[],
  now: Date
): ChatGroup[] {
  const today = startOfDay(now)
  const yesterday = today - 86_400_000
  const sevenDaysAgo = today - 7 * 86_400_000

  const buckets: Record<ChatGroupKey, ChatListItemSchema[]> = {
    today: [],
    yesterday: [],
    last7Days: [],
    older: [],
  }

  for (const item of items) {
    const day = startOfDay(new Date(item.last_message_at))
    if (day === today) buckets.today.push(item)
    else if (day === yesterday) buckets.yesterday.push(item)
    else if (day >= sevenDaysAgo) buckets.last7Days.push(item)
    else buckets.older.push(item)
  }

  return (["today", "yesterday", "last7Days", "older"] as const)
    .map((key) => ({ key, items: buckets[key] }))
    .filter((group) => group.items.length > 0)
}
