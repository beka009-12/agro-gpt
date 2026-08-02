"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/src/components/layout/profile-menu";
import { ChatHeader } from "./chat-header";
import { ChatSidebar } from "./chat-sidebar";
import { ChatView } from "./chat-view";
import { useViewportHeight } from "../hooks/useViewportHeight";

const DESKTOP_QUERY = "(min-width: 1024px)";

export function ChatShell() {
  useViewportHeight();

  const [sessionId, setSessionId] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { profile, setProfile } = useProfile();

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);

    const syncSidebarWithViewport = () => {
      setSidebarOpen(media.matches);
    };

    syncSidebarWithViewport();
    media.addEventListener("change", syncSidebarWithViewport);

    return () => {
      media.removeEventListener("change", syncSidebarWithViewport);
    };
  }, []);

  const hasProfileLocation =
    profile !== null &&
    profile.latitude !== null &&
    profile.longitude !== null;

  const startNewChat = () => {
    setSessionId((id) => id + 1);

    // На телефоне после выбора действия закрываем drawer,
    // как это делает мобильный интерфейс ChatGPT.
    if (!window.matchMedia(DESKTOP_QUERY).matches) {
      setSidebarOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-x-0 flex min-h-0 w-full overflow-hidden"
      style={{
        top: "var(--app-offset-top, 0px)",
        height: "var(--app-height, 100dvh)",
      }}
    >
      <ChatSidebar
        onNewChat={startNewChat}
        profile={profile}
        onProfileChange={setProfile}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-card">
        <div
          aria-hidden
          className="chat-pattern pointer-events-none absolute inset-0"
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
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
