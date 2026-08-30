"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { useI18n } from "@/src/i18n/client";
import { ProfileMenu } from "@/src/components/layout/profile-menu";
import type { UserProfile } from "@/src/lib/profile-schemas";
import { ArrowLeftIcon, MenuIcon, PlantIcon } from "@/src/components/ui/icons";

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
        aria-label={dict.chat.back}
        className="grid size-11 flex-none place-items-center rounded-xl text-fg-muted transition-colors duration-150 hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeftIcon size={20} />
      </Link>

      <span
        aria-hidden
        className="ml-0.5 grid size-10 flex-none place-items-center rounded-xl bg-accent-soft text-accent sm:ml-1"
      >
        <PlantIcon size={21} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold tracking-[-0.01em] text-fg sm:text-[15px]">
          {dict.chat.title}
        </p>
        <p className="mt-0.5 hidden items-center gap-1.5 text-xs font-semibold text-fg-faint sm:flex">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {dict.chat.status}
        </p>
      </div>

      <div className="lg:hidden">
        {profile && (
          <ProfileMenu profile={profile} onProfileChange={onProfileChange} />
        )}
      </div>
    </header>
  );
}
