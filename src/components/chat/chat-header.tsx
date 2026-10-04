"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { useI18n } from "@/src/i18n/client";
import { LogoMark } from "@/src/components/layout/logo";
import { ProfileMenu } from "@/src/components/layout/profile-menu";
import type { UserProfile } from "@/src/lib/profile-schemas";
import { ArrowLeftIcon, MenuIcon } from "@/src/components/ui/icons";

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
    <>
      <header className="flex h-14 flex-none items-center gap-2 bg-white px-3 sm:px-5 lg:hidden">
        <button
          ref={sidebarTriggerRef}
          type="button"
          onClick={onOpenSidebar}
          aria-label={dict.chat.openSidebarLabel}
          aria-expanded={sidebarOpen}
          className="grid size-11 flex-none place-items-center rounded-xl text-fg-muted transition-colors duration-150 hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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

        {profile && (
          <ProfileMenu profile={profile} onProfileChange={onProfileChange} />
        )}
      </header>

      {/* на десктопе вместо шапки — только кнопка, чтобы чат начинался от верхнего края */}
      <Link
        href="/"
        className="absolute left-4 top-3 z-20 hidden h-10 items-center gap-2 rounded-xl bg-white/90 px-3 text-sm font-semibold text-fg-muted backdrop-blur-sm transition-colors duration-150 hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:flex"
      >
        <ArrowLeftIcon size={16} />
        <span>{dict.chat.back}</span>
      </Link>
    </>
  );
}
