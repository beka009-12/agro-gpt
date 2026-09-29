import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ChatShell } from "@/src/components/chat/chat-shell"
import { getDict } from "@/src/i18n/server"
import { chatIdSchema } from "@/src/lib/chat-schemas"

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict()
  return {
    title: dict.meta.chat.title,
    description: dict.meta.chat.description,
    robots: { index: false },
  }
}

export default async function ChatByIdPage({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  const { chatId } = await params
  if (!chatIdSchema.safeParse(chatId).success) notFound()

  return <ChatShell initialChatId={chatId} />
}
