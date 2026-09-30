import type { ChatMessage } from "./types"

export interface HistoryMessage {
  id: string
  user_text: string | null
  user_image: string | null
  answer: string | null
  created_at: string
}

export interface HistoryResponse {
  messages: HistoryMessage[]
  has_more: boolean
}

export function mapHistoryMessage(message: HistoryMessage): ChatMessage[] {
  const out: ChatMessage[] = []

  if (message.user_text || message.user_image) {
    out.push({
      id: `${message.id}-user`,
      role: "user",
      text: message.user_text ?? "",
      imageUrl: message.user_image ?? undefined,
    })
  }

  if (message.answer) {
    out.push({
      id: `${message.id}-bot`,
      role: "bot",
      text: message.answer,
    })
  }

  return out
}

export function parseHistoryResponse(data: unknown): HistoryResponse | null {
  if (
    data !== null &&
    typeof data === "object" &&
    "messages" in data &&
    Array.isArray(data.messages) &&
    "has_more" in data &&
    typeof data.has_more === "boolean"
  ) {
    return data as HistoryResponse
  }
  return null
}
