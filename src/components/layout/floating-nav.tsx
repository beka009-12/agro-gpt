"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useI18n } from "@/src/i18n/client"
import { ArrowUpIcon, HomeIcon } from "@/src/components/ui/icons"

const BUTTON_CLASSES =
  "flex size-11 items-center justify-center rounded-full border border-edge bg-card text-accent shadow-[0_4px_20px_rgba(45,106,79,0.15)] transition-all duration-300 hover:bg-mint-soft"

interface FloatingNavProps {
  showHome?: boolean
}

export function FloatingNav({ showHome = false }: FloatingNavProps) {
  const { dict: ru } = useI18n()
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2.5 sm:bottom-6 sm:right-6">
      <button
        type="button"
        onClick={scrollToTop}
        aria-label={ru.floatingNav.toTop}
        aria-hidden={!showTop}
        tabIndex={showTop ? 0 : -1}
        className={`${BUTTON_CLASSES} ${
          showTop ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ArrowUpIcon size={18} />
      </button>
      {showHome && (
        <Link
          href="/"
          aria-label={ru.floatingNav.toHome}
          className={BUTTON_CLASSES}
        >
          <HomeIcon size={18} />
        </Link>
      )}
    </div>
  )
}
