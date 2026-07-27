"use client";

import { useState } from "react";
import { useProfile } from "@/src/components/layout/profile-menu";
import { ChatHeader } from "./chat-header";
import { ChatSidebar } from "./chat-sidebar";
import { ChatView } from "./chat-view";
import { useViewportHeight } from "../hooks/useViewportHeight";

export function ChatShell() {
  useViewportHeight();
  const [sessionId, setSessionId] = useState(0);
  const { profile, setProfile } = useProfile();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const hasProfileLocation =
    profile !== null &&
    (profile.location_available ||
      (profile.latitude !== null && profile.longitude !== null));

  return (
    <div
      className="flex overflow-hidden"
      style={{ height: "var(--app-height)" }}
    >
      <ChatSidebar
        onNewChat={() => setSessionId((id) => id + 1)}
        profile={profile}
        onProfileChange={setProfile}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
      />
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-card">
        <div
          aria-hidden
          className="chat-pattern pointer-events-none absolute inset-0"
        />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <ChatHeader
            profile={profile}
            onProfileChange={setProfile}
            onOpenSidebar={() => setSidebarOpen(true)}
            sidebarOpen={sidebarOpen}
          />
          <ChatView key={sessionId} hasProfileLocation={hasProfileLocation} />
        </div>
      </main>
    </div>
  );
}
