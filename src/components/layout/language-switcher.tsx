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

function useLocaleSwitch() {
  const router = useRouter()
  const { locale, dict } = useI18n()
  const [pending, setPending] = useState(false)

  const switchTo = async (next: Locale) => {
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

  return { locale, dict, pending, switchTo }
}

/** Десктоп: сегментированные пилюли; мобильный: компактная кнопка с меню. */
export function LanguageSwitcher() {
  const { locale, dict, pending, switchTo } = useLocaleSwitch()
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

  const choose = (code: Locale) => {
    setOpen(false)
    void switchTo(code)
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="hidden items-center rounded-full border border-edge bg-card p-0.5 sm:flex">
        {LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            disabled={pending}
            onClick={() => choose(code)}
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
              onClick={() => choose(code)}
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

/** Ряд языков с полными названиями — для бургер-меню. */
export function LanguageMenuList({ onDone }: { onDone?: () => void }) {
  const { locale, dict, pending, switchTo } = useLocaleSwitch()

  return (
    <div className="grid grid-cols-3 gap-2">
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          disabled={pending}
          onClick={() => {
            onDone?.()
            void switchTo(code)
          }}
          aria-pressed={code === locale}
          className={`rounded-xl border px-2 py-2.5 text-center text-[13px] transition-colors disabled:opacity-60 ${
            code === locale
              ? "border-accent bg-mint-soft font-semibold text-accent"
              : "border-edge bg-card font-medium text-fg-muted"
          }`}
        >
          {dict.languageSwitcher[code]}
        </button>
      ))}
    </div>
  )
}
