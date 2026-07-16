"use client"

import { useState, type ReactNode } from "react"
import { ChatSidebar } from "./chat-sidebar"
import { ChatView } from "./chat-view"

interface ChatShellProps {
  header: ReactNode
}

export function ChatShell({ header }: ChatShellProps) {
  const [sessionId, setSessionId] = useState(0)

  return (
    <div className="flex h-dvh overflow-hidden">
      <ChatSidebar onNewChat={() => setSessionId((id) => id + 1)} />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-card">
        {header}
        <ChatView key={sessionId} />
      </main>
    </div>
  )
}
