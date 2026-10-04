export interface ChatMessageRetry {
  text: string
  image?: File
}

export interface ChatMessage {
  id: string
  role: "user" | "bot" | "error"
  text: string
  imageUrl?: string
  imageName?: string
  /** только у ошибок, которые имеет смысл повторить (сеть, 5xx) */
  retry?: ChatMessageRetry
}
