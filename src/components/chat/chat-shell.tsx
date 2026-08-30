"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { useProfile } from "@/src/components/layout/profile-menu";
import { ChatHeader } from "./chat-header";
import { ChatSidebar } from "./chat-sidebar";
import { ChatView } from "./chat-view";
import {
  createSidebarState,
  getSidebarPresentation,
  reduceSidebarState,
} from "./sidebar-state";
import { useViewportHeight } from "../hooks/useViewportHeight";

const DESKTOP_QUERY = "(min-width: 1024px)";

export function ChatShell() {
  useViewportHeight();

  const [sessionId, setSessionId] = useState(0);
  const [sidebarState, dispatchSidebar] = useReducer(
    reduceSidebarState,
    createSidebarState(),
  );
  const sidebarTriggerRef = useRef<HTMLButtonElement>(null);
  const { profile, setProfile } = useProfile();

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const syncViewport = () => {
      dispatchSidebar({ type: "viewport-changed", isDesktop: media.matches });
    };

    syncViewport();
    media.addEventListener("change", syncViewport);

    return () => {
      media.removeEventListener("change", syncViewport);
    };
  }, []);

  const presentation = getSidebarPresentation(sidebarState);
  const hasProfileLocation =
    profile !== null &&
    profile.latitude !== null &&
    profile.longitude !== null;

  const startNewChat = () => {
    setSessionId((id) => id + 1);
    dispatchSidebar({ type: "new-chat" });
  };

  return (
    <div
      className="fixed inset-x-0 flex min-h-0 w-full overflow-hidden bg-white"
      style={{
        top: "var(--app-offset-top, 0px)",
        height: "var(--app-height, 100dvh)",
      }}
    >
      <ChatSidebar
        onNewChat={startNewChat}
        profile={profile}
        onProfileChange={setProfile}
        isDesktop={sidebarState.isDesktop}
        desktopExpanded={presentation.desktopExpanded}
        mobileOpen={presentation.mobileOpen}
        triggerRef={sidebarTriggerRef}
        onToggle={() => dispatchSidebar({ type: "toggle" })}
        onClose={() => dispatchSidebar({ type: "close" })}
      />

      <main
        inert={presentation.mobileOpen ? true : undefined}
        className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white"
      >
        <ChatHeader
          profile={profile}
          onProfileChange={setProfile}
          onOpenSidebar={() => dispatchSidebar({ type: "open" })}
          sidebarOpen={presentation.mobileOpen}
          sidebarTriggerRef={sidebarTriggerRef}
        />

        <ChatView key={sessionId} hasProfileLocation={hasProfileLocation} />
      </main>
    </div>
  );
}
