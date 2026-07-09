import Link from "next/link"
import ru from "@/src/i18n/ru.json"
import { LogoMark } from "./logo"

export function Footer() {
  return (
    <footer className="border-t border-edge py-7">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4">
        <span className="flex items-center gap-2">
          <LogoMark size={22} />
          <span className="text-[15px] font-bold text-fg">ibo</span>
        </span>
        <span className="text-[13px] text-fg-faint">{ru.footer.copyright}</span>
        <Link
          href="/chat"
          className="text-[13px] font-semibold text-accent transition-colors hover:text-accent-strong"
        >
          {ru.footer.askLink}
        </Link>
      </div>
    </footer>
  )
}
