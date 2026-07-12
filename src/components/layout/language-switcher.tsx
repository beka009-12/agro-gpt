"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/src/i18n/client"
import { LOCALES, type Locale } from "@/src/i18n/config"
import {
  CheckIcon,
  ChevronDownIcon,
  GlobeIcon,
} from "@/src/components/ui/icons"

export function LanguageSwitcher() {
  const router = useRouter()
  const { locale, dict } = useI18n()
  const [pending, setPending] = useState(false)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const switchTo = async (next: Locale) => {
    setOpen(false)
    if (pending || next === locale) return
    setPending(true)
    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: next }),
      })
      router.refresh()
    } catch (error) {
      console.error("[language-switcher]", error)
    } finally {
      setPending(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      {/* десктоп: сегментированные пилюли */}
      <div className="hidden items-center rounded-full border border-edge bg-card p-0.5 sm:flex">
        {LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            disabled={pending}
            onClick={() => void switchTo(code)}
            aria-label={dict.languageSwitcher[code]}
            aria-pressed={code === locale}
            className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase transition-colors disabled:opacity-60 ${
              code === locale
                ? "bg-accent text-white"
                : "text-fg-faint hover:text-fg"
            }`}
          >
            {code}
          </button>
        ))}
      </div>

      {/* мобильный: компактная кнопка + меню */}
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={dict.languageSwitcher[locale]}
        className="flex items-center gap-1 rounded-full border border-edge bg-card px-2.5 py-1.5 text-xs font-bold uppercase text-fg transition-colors disabled:opacity-60 sm:hidden"
      >
        <GlobeIcon size={14} className="text-accent" />
        {locale}
        <ChevronDownIcon
          size={12}
          className={`text-fg-faint transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-edge bg-card py-1 shadow-[0_12px_32px_rgba(45,106,79,0.16)] sm:hidden">
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              disabled={pending}
              onClick={() => void switchTo(code)}
              className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm transition-colors disabled:opacity-60 ${
                code === locale
                  ? "bg-mint-soft font-semibold text-accent"
                  : "font-medium text-fg-muted hover:bg-bg hover:text-fg"
              }`}
            >
              {dict.languageSwitcher[code]}
              {code === locale && <CheckIcon size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
