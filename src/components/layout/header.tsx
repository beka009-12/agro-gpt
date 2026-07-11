"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import ru from "@/src/i18n/ru.json"
import { LogoMark } from "./logo"

export function Header() {
  const [scrolled, setScrolled] = useState(false)

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
        <nav className="flex items-center gap-3 sm:gap-6">
          <a
            href="#features"
            className="hidden text-sm font-medium text-fg-muted transition-colors hover:text-fg sm:block"
          >
            {ru.header.nav.features}
          </a>
          <a
            href="#how-it-works"
            className="hidden text-sm font-medium text-fg-muted transition-colors hover:text-fg sm:block"
          >
            {ru.header.nav.howItWorks}
          </a>
          <Link
            href="/chat"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
          >
            {ru.header.startChat}
          </Link>
        </nav>
      </div>
    </header>
  )
}
