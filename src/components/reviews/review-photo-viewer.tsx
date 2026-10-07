"use client"

import Image from "next/image"
import { useEffect, useRef, type PointerEvent } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "@/src/components/ui/icons"
import { getDialogFocusTarget } from "@/src/components/landing/disease-details-dialog"
import { useI18n } from "@/src/i18n/client"
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens"

interface ReviewPhotoViewerProps {
  photos: ReadonlyArray<{ id: string; url: string }>
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
}

const SWIPE_THRESHOLD = 48

const NAV_BUTTON =
  "grid size-12 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-black/65 active:scale-95"

export function ReviewPhotoViewer({
  photos,
  index,
  onIndexChange,
  onClose,
}: ReviewPhotoViewerProps) {
  const { dict } = useI18n()
  const labels = dict.reviews
  const reduced = useReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)
  const handlers = useRef({ onClose, onIndexChange, index })

  useEffect(() => {
    handlers.current = { onClose, onIndexChange, index }
  }, [onClose, onIndexChange, index])

  const open = index !== null
  const total = photos.length

  useEffect(() => {
    if (!open) return

    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow

    function step(delta: number) {
      const current = handlers.current.index
      if (current === null || total < 2) return
      handlers.current.onIndexChange((current + delta + total) % total)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        handlers.current.onClose()
        return
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        step(event.key === "ArrowLeft" ? -1 : 1)
        return
      }
      if (event.key !== "Tab") return

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>("button:not([tabindex='-1'])") ?? []
      )
      const targetIndex = getDialogFocusTarget({
        activeIndex: focusable.findIndex((el) => el === document.activeElement),
        focusableCount: focusable.length,
        shiftKey: event.shiftKey,
      })
      if (targetIndex === null) return
      event.preventDefault()
      focusable[targetIndex]?.focus()
    }

    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)
    closeRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
      previousFocus?.focus()
    }
  }, [open, total])

  function go(delta: number) {
    if (index === null) return
    onIndexChange((index + delta + total) % total)
  }

  function handlePointerDown(event: PointerEvent) {
    swiped.current = false
    swipeStart.current = { x: event.clientX, y: event.clientY }
  }

  function handlePointerUp(event: PointerEvent) {
    const start = swipeStart.current
    swipeStart.current = null
    if (!start || total < 2) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return
    // после свайпа браузер пришлёт click по фону — он не должен закрыть просмотр
    swiped.current = true
    go(dx < 0 ? 1 : -1)
  }

  function handleBackdropClick() {
    if (swiped.current) {
      swiped.current = false
      return
    }
    onClose()
  }

  if (typeof document === "undefined") return null

  const photo = index !== null ? photos[index] : null

  return createPortal(
    <AnimatePresence>
      {photo ? (
        <motion.div
          key="review-photo-viewer"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={labels.photoViewer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.fast }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="review-photo-viewer fixed inset-0 z-[70] touch-pan-y bg-[#06140d] text-white"
        >
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={handleBackdropClick}
            className="absolute inset-0 cursor-default"
          />

          {/* поля под панели сверху/снизу; на низких экранах (телефон боком) панели лежат поверх фото */}
          <div className="pointer-events-none absolute inset-0 px-3 py-[72px] sm:px-24 sm:py-20 [@media(max-height:520px)]:px-20 [@media(max-height:520px)]:py-3">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={photo.id}
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.base, ease: EASE_OUT }}
                className="relative size-full"
              >
                <Image
                  src={photo.url}
                  alt={labels.photoAlt}
                  fill
                  sizes="100vw"
                  unoptimized={!photo.url.startsWith("/")}
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-4 px-3 pt-[max(12px,env(safe-area-inset-top))] sm:px-6 sm:pt-5 [@media(max-height:520px)]:pt-3">
            {total > 1 ? (
              <p
                aria-live="polite"
                className="rounded-full bg-black/45 px-3 py-1.5 text-sm font-semibold tabular-nums backdrop-blur-sm"
              >
                {(index ?? 0) + 1} / {total}
              </p>
            ) : null}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={labels.closePhoto}
              className={`${NAV_BUTTON} pointer-events-auto ml-auto`}
            >
              <XIcon size={20} />
            </button>
          </div>

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={labels.prevPhoto}
                className={`${NAV_BUTTON} absolute left-2 top-1/2 -translate-y-1/2 sm:left-6`}
              >
                <ChevronLeftIcon size={22} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={labels.nextPhoto}
                className={`${NAV_BUTTON} absolute right-2 top-1/2 -translate-y-1/2 sm:right-6`}
              >
                <ChevronRightIcon size={22} />
              </button>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-[max(20px,env(safe-area-inset-bottom))] sm:pb-7 [@media(max-height:520px)]:pb-3"
              >
                <span className="flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-2 backdrop-blur-sm">
                  {photos.map((p, i) => (
                    <span
                      key={p.id}
                      className={`h-1.5 rounded-full transition-all duration-200 ${
                        i === index ? "w-5 bg-white" : "w-1.5 bg-white/40"
                      }`}
                    />
                  ))}
                </span>
              </div>
            </>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}
