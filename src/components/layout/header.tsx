"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import ru from "@/src/i18n/ru.json"

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
          ? "border-b border-edge bg-bg-elevated/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-xl font-bold text-fg" aria-label="ibo">
          ibo<span className="text-accent">●</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm text-fg-muted transition-colors hover:text-fg"
          >
            {ru.header.login}
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition-shadow hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]"
          >
            {ru.header.register}
          </Link>
        </nav>
      </div>
    </header>
  )
}
