import Link from "next/link"
import { getDict } from "@/src/i18n/server"
import { LanguageSwitcher } from "@/src/components/layout/language-switcher"
import { PlantIcon } from "@/src/components/ui/icons"
import { LogoutButton } from "./logout-button"

export async function ChatHeader() {
  const ru = await getDict()
  return (
    <header className="flex items-center gap-3 border-b border-edge bg-card px-4 py-3.5 sm:px-6">
      <Link
        href="/"
        aria-label={ru.chat.back}
        className="rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-fg-muted transition-colors hover:bg-mint-soft hover:text-fg"
      >
        <span aria-hidden className="sm:hidden">←</span>
        <span className="hidden sm:inline">{ru.chat.back}</span>
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
      <LanguageSwitcher />
      <LogoutButton />
    </header>
  )
}
