"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import ru from "@/src/i18n/ru.json"
import { USER_COOKIE } from "@/src/lib/auth-cookies"

function hasUserCookie(): boolean {
  return document.cookie
    .split("; ")
    .some((part) => part.startsWith(`${USER_COOKIE}=`))
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    setAuthenticated(hasUserCookie())

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
        <Link href="/" className="font-display text-2xl font-bold text-fg" aria-label="ibo">
          ibo<span className="text-accent">●</span>
        </Link>
        {authenticated ? (
          <nav className="flex items-center">
            <Link
              href="/chat"
              className="rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-colors hover:bg-fg-soft"
            >
              {ru.header.openChat}
            </Link>
          </nav>
        ) : (
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="px-2 py-2 text-sm text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
            >
              {ru.header.login}
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-colors hover:bg-fg-soft"
            >
              {ru.header.register}
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
