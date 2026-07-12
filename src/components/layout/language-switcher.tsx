"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useI18n } from "@/src/i18n/client"
import { LOCALES, type Locale } from "@/src/i18n/config"

export function LanguageSwitcher() {
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

  return (
    <div className="flex items-center rounded-full border border-edge bg-card p-0.5">
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
  )
}
