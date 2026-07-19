"use client"

import Link from "next/link"
import { useI18n } from "@/src/i18n/client"
import { LanguageSwitcher } from "@/src/components/layout/language-switcher"
import { ProfileMenu } from "@/src/components/layout/profile-menu"
import type { UserProfile } from "@/src/lib/profile-schemas"
import { ArrowLeftIcon, PlantIcon } from "@/src/components/ui/icons"

interface ChatHeaderProps {
  profile: UserProfile | null
  onProfileChange: (profile: UserProfile | null) => void
}

export function ChatHeader({ profile, onProfileChange }: ChatHeaderProps) {
  const { dict: ru } = useI18n()

  return (
    <header className="flex items-center gap-3 border-b border-edge bg-card px-4 py-3.5 sm:px-6">
      <Link
        href="/"
        aria-label={ru.chat.back}
        className="grid size-9 flex-none place-items-center rounded-xl text-fg-muted transition-colors hover:bg-mint-soft hover:text-fg"
      >
        <ArrowLeftIcon size={20} />
      </Link>
      <span aria-hidden className="h-5 w-px bg-edge" />
      <span
        aria-hidden
        className="grid size-9 flex-none place-items-center rounded-xl bg-[linear-gradient(145deg,#16a34a,#064e3b)] text-white"
      >
        <PlantIcon size={20} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-extrabold text-fg">
          {ru.chat.title}
        </p>
        <p className="mt-0.5 hidden items-center gap-1.5 text-xs font-bold text-[#248449] sm:flex">
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-accent shadow-[0_0_0_4px_rgba(34,197,94,0.12)]"
          />
          {ru.chat.status}
        </p>
      </div>
      <div className="flex items-center gap-2 lg:hidden">
        <LanguageSwitcher />
        {profile && (
          <ProfileMenu profile={profile} onProfileChange={onProfileChange} />
        )}
      </div>
    </header>
  )
}
