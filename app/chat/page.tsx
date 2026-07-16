import type { Metadata } from "next"
import { ChatHeader } from "@/src/components/chat/chat-header"
import { ChatShell } from "@/src/components/chat/chat-shell"

export const metadata: Metadata = {
  title: "ibo — чат",
}

export default function ChatPage() {
  return <ChatShell header={<ChatHeader />} />
}
