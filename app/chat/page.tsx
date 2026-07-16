import type { Metadata } from "next"
import { ChatShell } from "@/src/components/chat/chat-shell"
import { getDict } from "@/src/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict()
  return {
    title: dict.meta.chat.title,
    description: dict.meta.chat.description,
    robots: { index: false },
  }
}

export default function ChatPage() {
  return <ChatShell />
}
