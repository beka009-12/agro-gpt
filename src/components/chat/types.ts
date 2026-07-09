export interface ChatMessage {
  id: string
  role: "user" | "bot"
  text: string
  imageUrl?: string
  imageName?: string
}
