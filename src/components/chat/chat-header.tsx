import Link from "next/link"
import { getDict } from "@/src/i18n/server"
import { LanguageSwitcher } from "@/src/components/layout/language-switcher"
import { LogoMark } from "@/src/components/layout/logo"
import { LogoutButton } from "./logout-button"

export async function ChatHeader() {
  const ru = await getDict()
  return (
    <header className="flex items-center gap-3.5 border-b border-edge bg-card px-4 py-4 sm:px-6">
      <Link
        href="/"
        className="rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-fg-muted transition-colors hover:bg-mint-soft hover:text-fg"
      >
        {ru.chat.back}
      </Link>
      <span aria-hidden className="h-5 w-px bg-edge" />
      <LogoMark size={40} className="flex-none" />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold text-fg">{ru.chat.botName}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-accent">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {ru.chat.online}
        </p>
      </div>
      <LanguageSwitcher />
      <LogoutButton />
    </header>
  )
}
