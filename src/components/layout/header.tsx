"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/src/i18n/client"
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens"
import { LanguageSwitcher } from "./language-switcher"
import { LogoMark } from "./logo"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { dict: ru } = useI18n()
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [menuOpen])

  const close = () => setMenuOpen(false)
  const onAbout = pathname === "/about"

  return (
    <header
      ref={rootRef}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || menuOpen
          ? "border-b border-edge bg-bg/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link
          href="/"
          aria-label={ru.header.logoAria}
          onClick={close}
          className="flex items-center gap-2.5"
        >
          <LogoMark size={30} />
          <span className="text-[19px] font-bold tracking-tight text-fg">
            ibo
          </span>
        </Link>

        {/* десктоп-навигация */}
        <nav className="hidden items-center gap-5 sm:flex">
          <LanguageSwitcher />
          <Link
            href={onAbout ? "/" : "/about"}
            className="text-sm font-medium text-fg-muted transition-colors hover:text-fg"
          >
            {onAbout ? ru.header.nav.home : ru.header.nav.about}
          </Link>
          <Link
            href="/chat"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
          >
            {ru.header.startChat}
          </Link>
        </nav>

        {/* мобильный бургер */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={ru.header.menuLabel}
          className="flex size-10 flex-col items-center justify-center gap-[5px] rounded-full sm:hidden"
        >
          <motion.span
            aria-hidden
            animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
            transition={{ duration: reduced ? 0.1 : DURATION.fast, ease: EASE_OUT }}
            className="h-[2px] w-5 rounded-full bg-fg"
          />
          <motion.span
            aria-hidden
            animate={menuOpen ? { rotate: -45, y: -2 } : { rotate: 0, y: 0 }}
            transition={{ duration: reduced ? 0.1 : DURATION.fast, ease: EASE_OUT }}
            className="h-[2px] w-5 rounded-full bg-fg"
          />
        </button>
      </div>

      {/* мобильная панель меню */}
      <AnimatePresence mode="wait">
        {menuOpen && (
          <motion.nav
            key="mobile-menu"
            initial={{ opacity: 0, y: reduced ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8 }}
            transition={{ duration: DURATION.fast, ease: EASE_OUT }}
            className="border-t border-edge px-4 pb-5 pt-3 sm:hidden"
          >
            <Link
              href={onAbout ? "/" : "/about"}
              onClick={close}
              className="block rounded-xl px-3 py-3 text-[15px] font-medium text-fg transition-colors hover:bg-mint-soft"
            >
              {onAbout ? ru.header.nav.home : ru.header.nav.about}
            </Link>
            <Link
              href="/chat"
              onClick={close}
              className="mt-2 block rounded-full bg-accent px-5 py-3 text-center text-[15px] font-bold text-white transition-colors hover:bg-accent-strong"
            >
              {ru.header.startChat}
            </Link>
            <div className="mt-4 border-t border-edge pt-4">
              <LanguageSwitcher variant="row" onDone={close} />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
