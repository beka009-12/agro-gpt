"use client";

import Link from "next/link";
import { useI18n } from "@/src/i18n/client";
import { ProfileMenu } from "@/src/components/layout/profile-menu";
import type { UserProfile } from "@/src/lib/profile-schemas";
import { ArrowLeftIcon, PlantIcon, MenuIcon } from "@/src/components/ui/icons";

interface ChatHeaderProps {
  profile: UserProfile | null;
  onProfileChange: (profile: UserProfile | null) => void;
  onOpenSidebar: () => void;
  sidebarOpen: boolean;
}

export function ChatHeader({
  profile,
  onProfileChange,
  onOpenSidebar,
  sidebarOpen,
}: ChatHeaderProps) {
  const { dict: ru } = useI18n();

  return (
    <header className="flex items-center gap-2 border-b border-edge bg-card/95 px-3 py-3 backdrop-blur sm:gap-3 sm:px-6 sm:py-3.5">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Открыть боковую панель"
        aria-expanded={sidebarOpen}
        className={`grid size-9 flex-none place-items-center rounded-xl text-fg-muted transition-colors hover:bg-mint-soft hover:text-fg ${
          sidebarOpen ? "lg:hidden" : ""
        }`}
      >
        <MenuIcon size={20} />
      </button>

      <span aria-hidden className="h-5 w-px bg-edge" />

      <Link
        href="/"
        aria-label={ru.chat.back}
        className="grid size-9 flex-none place-items-center rounded-xl text-fg-muted transition-colors hover:bg-mint-soft hover:text-fg"
      >
        <ArrowLeftIcon size={20} />
      </Link>

      <span aria-hidden className="hidden h-5 w-px bg-edge sm:block" />

      <span
        aria-hidden
        className="grid size-9 flex-none place-items-center rounded-xl bg-accent text-accent-contrast"
      >
        <PlantIcon size={20} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-extrabold text-fg sm:text-[15px]">
          {ru.chat.title}
        </p>

        <p className="mt-0.5 hidden items-center gap-1.5 text-xs font-bold text-accent sm:flex">
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-accent shadow-[0_0_0_4px_rgba(34,197,94,0.12)]"
          />
          {ru.chat.status}
        </p>
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        {profile && (
          <ProfileMenu profile={profile} onProfileChange={onProfileChange} />
        )}
      </div>
    </header>
  );
}
