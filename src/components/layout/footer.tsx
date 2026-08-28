import Link from "next/link"
import { getDict } from "@/src/i18n/server"
import { LogoMark } from "./logo"

export async function Footer() {
  const ru = await getDict()
  return (
    <footer className="border-t border-edge bg-white py-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:grid-cols-[1fr_auto] sm:items-end md:px-8">
        <span className="flex items-center gap-2">
          <LogoMark size={26} />
          <span className="font-display text-lg font-semibold tracking-[-0.02em] text-fg">ibo</span>
        </span>
        <span className="flex flex-wrap items-center gap-5 sm:justify-end">
          <Link
            href="/about"
            className="text-[13px] font-semibold text-accent transition-colors hover:text-accent-strong"
          >
            {ru.footer.aboutLink}
          </Link>
          <span className="text-[13px] font-semibold text-fg-faint">
            {ru.footer.support}
          </span>
        </span>
        <span className="text-[13px] text-fg-faint sm:col-span-2">{ru.footer.copyright}</span>
      </div>
    </footer>
  )
}
