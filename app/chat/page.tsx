import type { Metadata } from "next"
import { ChatHeader } from "@/src/components/chat/chat-header"
import { ChatView } from "@/src/components/chat/chat-view"

export const metadata: Metadata = {
  title: "ibo — чат",
}

export default function ChatPage() {
  return (
    <main className="flex h-dvh flex-col">
      <ChatHeader />
      <ChatView />
    </main>
  )
}
