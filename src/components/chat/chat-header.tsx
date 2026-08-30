"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { useI18n } from "@/src/i18n/client";
import { LogoMark } from "@/src/components/layout/logo";
import { ProfileMenu } from "@/src/components/layout/profile-menu";
import type { UserProfile } from "@/src/lib/profile-schemas";
import { MenuIcon } from "@/src/components/ui/icons";

interface ChatHeaderProps {
  profile: UserProfile | null;
  onProfileChange: (profile: UserProfile | null) => void;
  onOpenSidebar: () => void;
  sidebarOpen: boolean;
  sidebarTriggerRef: RefObject<HTMLButtonElement | null>;
}

export function ChatHeader({
  profile,
  onProfileChange,
  onOpenSidebar,
  sidebarOpen,
  sidebarTriggerRef,
}: ChatHeaderProps) {
  const { dict } = useI18n();

  return (
    <header className="flex h-16 flex-none items-center gap-2 border-b border-edge bg-white px-3 sm:px-5 lg:h-[72px] lg:px-7">
      <button
        ref={sidebarTriggerRef}
        type="button"
        onClick={onOpenSidebar}
        aria-label={dict.chat.openSidebarLabel}
        aria-expanded={sidebarOpen}
        className="grid size-11 flex-none place-items-center rounded-xl text-fg-muted transition-colors duration-150 hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
      >
        <MenuIcon size={21} />
      </button>

      <Link
        href="/"
        aria-label={dict.header.logoAria}
        className="flex h-11 flex-none items-center gap-2 rounded-xl px-2 text-fg transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <LogoMark size={27} />
        <span className="text-base font-bold tracking-tight">ibo</span>
      </Link>

      <div className="flex-1" />

      <div className="lg:hidden">
        {profile && (
          <ProfileMenu profile={profile} onProfileChange={onProfileChange} />
        )}
      </div>
    </header>
  );
}
