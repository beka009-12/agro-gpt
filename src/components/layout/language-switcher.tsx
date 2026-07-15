"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/src/i18n/client"
import { LOCALES, type Locale } from "@/src/i18n/config"
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens"
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

const noopSubscribe = () => () => {}

/** true после гидратации — портал в body нельзя рендерить на сервере */
function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}

interface LanguageSwitcherProps {
  /** compact — пилюля для хедера; row — широкая строка для бургер-меню */
  variant?: "compact" | "row"
  /** вызывается после выбора языка (например, закрыть бургер-меню) */
  onDone?: () => void
}

/** Кнопка текущего языка; по нажатию снизу выезжает шторка выбора. */
export function LanguageSwitcher({
  variant = "compact",
  onDone,
}: LanguageSwitcherProps) {
  const { locale, dict, pending, switchTo } = useLocaleSwitch()
  const [open, setOpen] = useState(false)
  // портал: у хедера есть backdrop-filter, он делает fixed-потомков
  // относительными к себе — шторку рендерим в body
  const mounted = useMounted()
  const sheetRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  // Escape + скролл-лок, пока шторка открыта
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
      if (e.key === "Tab") {
        const focusable =
          sheetRef.current?.querySelectorAll<HTMLElement>("button")
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onKeyDown)
    sheetRef.current
      ?.querySelector<HTMLElement>("button[aria-pressed='true']")
      ?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const choose = (code: Locale) => {
    setOpen(false)
    onDone?.()
    void switchTo(code)
  }

  return (
    <>
      {variant === "compact" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={dict.languageSwitcher.title}
          className="flex items-center gap-1.5 rounded-full border border-edge bg-card px-3 py-1.5 text-xs font-bold uppercase text-fg transition-colors hover:border-mint hover:bg-mint-soft disabled:opacity-60"
        >
          <GlobeIcon size={14} className="text-accent" />
          {locale}
          <ChevronDownIcon size={12} className="text-fg-faint" />
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-header-mint-soft disabled:opacity-60"
        >
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-header-mint-soft text-header-accent"
          >
            <GlobeIcon size={16} />
          </span>
          <span className="flex-1 text-[15px] font-medium text-header-fg">
            {dict.languageSwitcher[locale]}
          </span>
          <ChevronDownIcon size={15} className="text-fg-faint" />
        </button>
      )}

      {mounted &&
        createPortal(
          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                key="language-sheet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.fast }}
                className="fixed inset-0 z-[70] flex items-end justify-center"
              >
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setOpen(false)}
                  className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-[2px]"
                />
                <motion.div
                  ref={sheetRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label={dict.languageSwitcher.title}
                  initial={reduced ? { opacity: 0 } : { y: "100%" }}
                  animate={reduced ? { opacity: 1 } : { y: 0 }}
                  exit={reduced ? { opacity: 0 } : { y: "100%" }}
                  transition={{ duration: DURATION.base * 0.7, ease: EASE_OUT }}
                  className="relative w-full max-w-md rounded-t-[26px] border border-edge bg-card px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_55px_rgba(6,78,59,0.18)] sm:mb-6 sm:rounded-[26px] sm:pb-5"
                >
                  <span
                    aria-hidden
                    className="mx-auto block h-1 w-10 rounded-full bg-edge"
                  />
                  <p className="mt-4 text-[15px] font-extrabold text-fg">
                    {dict.languageSwitcher.title}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {LOCALES.map((code) => (
                      <button
                        key={code}
                        type="button"
                        disabled={pending}
                        onClick={() => choose(code)}
                        aria-pressed={code === locale}
                        className={`flex w-full items-center justify-between rounded-[14px] border px-4 py-3.5 text-left text-[15px] transition-colors disabled:opacity-60 ${
                          code === locale
                            ? "border-mint bg-mint-soft font-bold text-accent"
                            : "border-edge bg-card font-medium text-fg hover:bg-bg"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className={`text-[11px] font-extrabold uppercase ${
                              code === locale ? "text-accent" : "text-fg-faint"
                            }`}
                          >
                            {code}
                          </span>
                          {dict.languageSwitcher[code]}
                        </span>
                        {code === locale && <CheckIcon size={16} />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
