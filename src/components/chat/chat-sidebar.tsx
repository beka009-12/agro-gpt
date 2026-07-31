"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/src/i18n/client";
import { PlusIcon, XIcon } from "@/src/components/ui/icons";
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
  onClose: () => void;
}

export function ChatSidebar({
  onNewChat,
  profile,
  onProfileChange,
  isOpen,
  onToggle,
  onClose,
}: ChatSidebarProps) {
  const { dict: ru } = useI18n();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Закрыть боковую панель"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        aria-label="Навигация чата"
        className={`
          fixed inset-y-0 left-0 z-50 flex h-full w-[min(86vw,320px)]
          flex-col overflow-hidden border-r border-edge bg-bg
          shadow-[18px_0_45px_rgba(15,23,42,0.16)]
          transition-transform duration-300 ease-out
          lg:static lg:z-auto lg:w-auto lg:shrink-0 lg:shadow-none
          lg:transition-[width] lg:duration-300
          ${
            isOpen
              ? "translate-x-0 lg:w-72"
              : "-translate-x-full lg:w-0 lg:translate-x-0 lg:border-r-0"
          }
        `}
      >
        <div className="flex min-w-[280px] items-center justify-between px-5 pb-5 pt-6">
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
            className="grid size-9 place-items-center rounded-xl text-fg-muted transition-colors hover:bg-mint-soft hover:text-fg"
            aria-label="Закрыть боковую панель"
          >
            <XIcon size={19} />
          </button>
        </div>

        <div className="min-w-[280px] px-4">
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

        <div className="flex min-w-[280px] items-center justify-between gap-2 border-t border-edge px-4 py-3.5">
          <LanguageSwitcher />
          {profile && (
            <ProfileMenu profile={profile} onProfileChange={onProfileChange} />
          )}
        </div>
      </aside>
    </>
  );
}
