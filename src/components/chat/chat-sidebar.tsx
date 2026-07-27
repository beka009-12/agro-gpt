"use client";

import Link from "next/link";
import { useI18n } from "@/src/i18n/client";
import { PlusIcon } from "@/src/components/ui/icons";
import { LanguageSwitcher } from "@/src/components/layout/language-switcher";
import { LogoMark } from "@/src/components/layout/logo";
import { ProfileMenu } from "@/src/components/layout/profile-menu";
import type { UserProfile } from "@/src/lib/profile-schemas";

interface ChatSidebarProps {
  onNewChat: () => void;
  profile: UserProfile | null;
  onProfileChange: (profile: UserProfile | null) => void;

  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({
  onNewChat,
  profile,
  onProfileChange,
  isOpen,
  onToggle,
}: ChatSidebarProps) {
  const { dict: ru } = useI18n();

  return (
    <aside
      className={`hidden lg:flex h-full flex-col border-r border-edge bg-bg transition-all duration-300 overflow-hidden ${
        isOpen ? "w-72" : "w-0 border-r-0"
      }`}
    >
      <div className="flex items-center justify-between px-5 pt-6 pb-5">
        <Link
          href="/"
          aria-label={ru.header.logoAria}
          className="flex items-center gap-2.5"
        >
          <LogoMark size={30} />
          <span className="text-[19px] font-bold tracking-tight text-fg">
            ibo
          </span>
        </Link>

        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-2 transition-colors cursor-pointer "
          aria-label="Закрыть боковую панель"
        >
          ✕
        </button>
      </div>

      <div className="px-4">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-mint bg-card px-4 py-3 text-sm font-bold text-accent-strong transition-colors hover:border-accent hover:bg-mint-soft"
        >
          <PlusIcon size={16} strokeWidth={2.25} />
          {ru.chat.newChat}
        </button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center justify-between gap-2 border-t border-edge px-4 py-3.5">
        <LanguageSwitcher />
        {profile && (
          <ProfileMenu profile={profile} onProfileChange={onProfileChange} />
        )}
      </div>
    </aside>
  );
}
