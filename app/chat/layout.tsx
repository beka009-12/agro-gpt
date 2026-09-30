import type { ReactNode } from "react"
import { ChatShell } from "@/src/components/chat/chat-shell"

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ChatShell />
    </>
  )
}
