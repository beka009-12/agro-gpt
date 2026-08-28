"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/src/i18n/client"
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens"
import {
  ChevronRightIcon,
  HomeIcon,
  LeafIcon,
} from "@/src/components/ui/icons"
import { LanguageSwitcher } from "./language-switcher"
import { LogoMark } from "./logo"
import { ProfileMenu, useProfile } from "./profile-menu"

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { dict: ru } = useI18n()
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const { profile, setProfile } = useProfile()

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return
      // шторка профиля рендерится порталом в body (вне header) — тап в ней
      // не должен закрывать бургер, иначе ProfileMenu размонтируется вместе с ним
      if (e.target instanceof Element && e.target.closest("[data-profile-sheet]"))
        return
      setMenuOpen(false)
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
      style={{ fontFamily: "var(--font-header)" }}
      className="sticky inset-x-0 top-0 z-50 border-b border-header-edge bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          aria-label={ru.header.logoAria}
          onClick={close}
          className="flex items-center gap-2.5"
        >
          <LogoMark size={30} />
          <span className="font-display text-[20px] font-semibold tracking-[-0.025em] text-header-fg">
            ibo
          </span>
        </Link>

        {/* десктоп-навигация */}
        <nav className="hidden items-center gap-6 sm:flex">
          <LanguageSwitcher />
          <Link
            href={onAbout ? "/" : "/about"}
            className="text-sm font-medium text-header-fg-muted transition-colors hover:text-header-fg"
          >
            {onAbout ? ru.header.nav.home : ru.header.nav.about}
          </Link>
          <Link
            href="/chat"
            className="inline-flex min-h-11 items-center rounded-control bg-header-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition-[background-color,transform] hover:bg-header-accent-strong active:translate-y-px"
          >
            {ru.header.startChat}
          </Link>
          {profile && (
            <ProfileMenu profile={profile} onProfileChange={setProfile} />
          )}
        </nav>

        {/* мобильный бургер */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={ru.header.menuLabel}
          className="flex size-11 flex-col items-center justify-center gap-[5px] rounded-control sm:hidden"
        >
          <motion.span
            aria-hidden
            animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
            transition={{ duration: reduced ? 0.1 : DURATION.fast, ease: EASE_OUT }}
            className="h-[2px] w-5 rounded-full bg-header-fg"
          />
          <motion.span
            aria-hidden
            animate={menuOpen ? { rotate: -45, y: -2 } : { rotate: 0, y: 0 }}
            transition={{ duration: reduced ? 0.1 : DURATION.fast, ease: EASE_OUT }}
            className="h-[2px] w-5 rounded-full bg-header-fg"
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
            className="border-t border-header-edge bg-white px-5 pb-5 pt-4 sm:hidden"
          >
            {profile && (
              <div className="mb-3 overflow-hidden rounded-2xl border border-header-edge bg-card">
                <ProfileMenu
                  profile={profile}
                  onProfileChange={setProfile}
                  variant="row"
                  onDone={close}
                />
              </div>
            )}
            <div className="divide-y divide-header-edge overflow-hidden rounded-2xl border border-header-edge bg-card">
              {[
                { href: "/", label: ru.header.nav.home, Icon: HomeIcon },
                { href: "/about", label: ru.header.nav.about, Icon: LeafIcon },
              ].map(({ href, label, Icon }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className="flex items-center gap-3 px-3.5 py-3 transition-colors hover:bg-header-mint-soft"
                  >
                    <span
                      aria-hidden
                      className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                        active
                          ? "bg-header-accent text-accent-contrast"
                          : "bg-header-mint-soft text-header-accent"
                      }`}
                    >
                      <Icon size={16} />
                    </span>
                    <span
                      className={`flex-1 text-[15px] ${
                        active
                          ? "font-bold text-header-accent-strong"
                          : "font-medium text-header-fg"
                      }`}
                    >
                      {label}
                    </span>
                    <ChevronRightIcon size={15} className="text-fg-faint" />
                  </Link>
                )
              })}
              <LanguageSwitcher variant="row" onDone={close} />
            </div>
            <Link
              href="/chat"
              onClick={close}
              className="mt-3 block rounded-control bg-header-accent px-5 py-3 text-center text-[15px] font-semibold text-accent-contrast transition-colors hover:bg-header-accent-strong"
            >
              {ru.header.startChat}
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
