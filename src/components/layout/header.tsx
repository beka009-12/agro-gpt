"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useI18n } from "@/src/i18n/client"
import { LanguageSwitcher } from "./language-switcher"
import { LogoMark } from "./logo"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { dict: ru } = useI18n()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-edge bg-bg/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
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
        <nav className="flex items-center gap-2.5 sm:gap-5">
          <LanguageSwitcher />
          <Link
            href="/about"
            className={`text-sm transition-colors hover:text-fg ${
              pathname === "/about"
                ? "font-bold text-fg"
                : "font-medium text-fg-muted"
            }`}
          >
            {ru.header.nav.about}
          </Link>
          <Link
            href="/chat"
            className="rounded-full bg-accent px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-accent-strong sm:px-5 sm:py-2.5 sm:text-sm"
          >
            {ru.header.startChat}
          </Link>
        </nav>
      </div>
    </header>
  )
}
