"use client";

import Link from "next/link";
import { useI18n } from "@/src/i18n/client";
import type { UserProfile } from "@/src/lib/profile-schemas";
import { LanguageSwitcher } from "./language-switcher";
import { ProfileMenu } from "./profile-menu";

interface HeaderActionsIslandProps {
  profile: UserProfile | null;
  onProfileChange: (profile: UserProfile | null) => void;
}

/** правый остров — язык + вход/регистрация (или аватар) + основной CTA. Виден от sm и выше */
export function HeaderActionsIsland({
  profile,
  onProfileChange,
}: HeaderActionsIslandProps) {
  const { dict } = useI18n();

  return (
    <div className="hidden items-center gap-1.5 rounded-full border border-header-edge bg-white/90 p-1.5 shadow-[0_2px_10px_rgba(6,78,59,0.05)] backdrop-blur-sm sm:flex">
      <LanguageSwitcher />

      {profile ? (
        <ProfileMenu profile={profile} onProfileChange={onProfileChange} />
      ) : (
        <>
          <Link
            href="/login"
            className="rounded-full px-3.5 py-2 text-[13px] font-semibold text-header-fg-muted transition-colors hover:text-header-fg"
          >
            {dict.header.login}
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-header-edge px-3.5 py-2 text-[13px] font-semibold text-header-fg transition-colors hover:border-header-accent hover:text-header-accent-strong"
          >
            {dict.header.register}
          </Link>
        </>
      )}

      <Link
        href="/chat"
        className="rounded-full bg-header-accent px-4 py-2 text-[13px] font-semibold text-accent-contrast transition-colors hover:bg-header-accent-strong"
      >
        {dict.header.startChat}
      </Link>
    </div>
  );
}
