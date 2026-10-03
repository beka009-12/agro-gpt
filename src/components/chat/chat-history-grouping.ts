import type { ChatListItemSchema } from "@/src/api/generated/models"

export interface ChatTopicItem {
  chat: ChatListItemSchema
  /** Текст в списке: без названия культуры, оно уже в заголовке группы. */
  label: string | null
}

export interface ChatTopicGroup {
  /** null — группа «Другое»: чаты без названия или без «Культура - проблема». */
  topic: string | null
  key: string
  items: ChatTopicItem[]
}

// Бэкенд называет чаты «Культура - проблема»; терпим длинное/короткое тире
const TOPIC_SEPARATOR = /\s+[-–—]\s+/
const OTHER_KEY = "__other__"

export function splitChatTitle(
  title: string | null,
): { topic: string; rest: string } | null {
  if (!title) return null
  const match = TOPIC_SEPARATOR.exec(title)
  if (!match) return null
  const topic = title.slice(0, match.index).trim()
  const rest = title.slice(match.index + match[0].length).trim()
  if (!topic || !rest) return null
  return { topic, rest }
}

function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1)
}

function lastActivity(chat: ChatListItemSchema): number {
  const time = Date.parse(chat.last_message_at)
  return Number.isNaN(time) ? 0 : time
}

/**
 * Группирует чаты по культуре из названия. Группы и чаты внутри — по свежести,
 * «Другое» всегда в конце.
 */
export function groupChatsByTopic(items: ChatListItemSchema[]): ChatTopicGroup[] {
  const sorted = [...items].sort((a, b) => lastActivity(b) - lastActivity(a))
  const groups = new Map<string, ChatTopicGroup>()

  for (const chat of sorted) {
    const parts = splitChatTitle(chat.title)
    const key = parts ? parts.topic.toLocaleLowerCase() : OTHER_KEY
    let group = groups.get(key)
    if (!group) {
      group = { topic: parts ? capitalize(parts.topic) : null, key, items: [] }
      groups.set(key, group)
    }
    group.items.push({ chat, label: parts ? capitalize(parts.rest) : chat.title })
  }

  const ordered = [...groups.values()]
  const otherIndex = ordered.findIndex((group) => group.key === OTHER_KEY)
  if (otherIndex !== -1) ordered.push(...ordered.splice(otherIndex, 1))
  return ordered
}
