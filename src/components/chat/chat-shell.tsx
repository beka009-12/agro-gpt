"use client"

import { useState } from "react"
import { useProfile } from "@/src/components/layout/profile-menu"
import { ChatHeader } from "./chat-header"
import { ChatSidebar } from "./chat-sidebar"
import { ChatView } from "./chat-view"

export function ChatShell() {
  const [sessionId, setSessionId] = useState(0)
  const { profile, setProfile } = useProfile()

  return (
    <div className="flex h-dvh overflow-hidden">
      <ChatSidebar
        onNewChat={() => setSessionId((id) => id + 1)}
        profile={profile}
        onProfileChange={setProfile}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-card">
        <ChatHeader profile={profile} onProfileChange={setProfile} />
        <ChatView key={sessionId} />
      </main>
    </div>
  )
}
