"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { XIcon } from "@/src/components/ui/icons"
import type { Dictionary } from "@/src/i18n/dictionaries"
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens"
import type { DiseaseDetails } from "@/src/lib/disease-intelligence"
import {
  getDialogFocusTarget,
  shouldCloseDiseaseDialog,
} from "./disease-details-dialog"

type DetailsStatus = "idle" | "loading" | "ready" | "error"

interface DiseaseDetailsModalProps {
  diseaseName: string | null
  diagnosesCount?: number
  details: DiseaseDetails | null
  status: DetailsStatus
  labels: Dictionary["diseaseIntelligence"]["details"]
  onClose: () => void
  onRetry: () => void
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'

export function DiseaseDetailsModal({
  diseaseName,
  diagnosesCount,
  details,
  status,
  labels,
  onClose,
  onRetry,
}: DiseaseDetailsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const reduced = useReducedMotion()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (diseaseName === null) return

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousOverflow = document.body.style.overflow

    function handleKeyDown(event: KeyboardEvent) {
      if (shouldCloseDiseaseDialog(event.key)) {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== "Tab") return

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
      )
      const activeIndex = focusable.findIndex(
        (element) => element === document.activeElement
      )

      if (activeIndex === -1 && focusable.length > 0) {
        event.preventDefault()
        focusable[0].focus()
        return
      }

      const targetIndex = getDialogFocusTarget({
        activeIndex,
        focusableCount: focusable.length,
        shiftKey: event.shiftKey,
      })
      if (targetIndex === null) return

      event.preventDefault()
      focusable[targetIndex]?.focus()
    }

    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)
    dialogRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
      previousFocus?.focus()
    }
  }, [diseaseName])

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {diseaseName !== null ? (
        <motion.div
          key="disease-details-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.fast }}
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-5"
        >
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-forest/50 backdrop-blur-[3px]"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="disease-details-title"
            aria-live="polite"
            tabIndex={-1}
            initial={
              reduced ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.985 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }
            }
            transition={{
              duration: DURATION.base * 0.72,
              ease: EASE_OUT,
            }}
            className="disease-details-dialog relative flex max-h-[calc(100dvh-16px)] w-full max-w-4xl flex-col overflow-hidden rounded-t-[26px] border border-edge bg-white shadow-[0_-18px_55px_rgba(6,78,59,0.2)] outline-none sm:max-h-[calc(100dvh-40px)] sm:rounded-[24px] sm:shadow-[0_24px_70px_rgba(6,78,59,0.2)]"
          >
            <span
              aria-hidden
              className="mx-auto mt-2.5 block h-1 w-10 shrink-0 rounded-full bg-edge sm:hidden"
            />

            <header className="flex shrink-0 items-start justify-between gap-5 border-b border-edge px-5 py-4 sm:px-7 sm:py-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-accent">
                  {labels.eyebrow}
                </p>
                <h3
                  id="disease-details-title"
                  className="mt-1 truncate font-display text-2xl font-semibold tracking-[-0.025em] text-fg sm:text-3xl"
                >
                  {diseaseName}
                </h3>
                {diagnosesCount !== undefined ? (
                  <p className="mt-1 text-sm text-fg-muted">
                    {labels.diagnoses.replace(
                      "{count}",
                      String(diagnosesCount)
                    )}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-10 shrink-0 items-center justify-center rounded-control border border-edge text-fg-muted transition-colors hover:border-accent hover:text-accent active:translate-y-px"
                aria-label={labels.close}
              >
                <XIcon size={18} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 sm:px-7 sm:pb-7">
              {status === "loading" ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-52 animate-pulse rounded-control bg-surface-muted"
                    />
                  ))}
                </div>
              ) : null}

              {status === "error" ? (
                <div className="py-10 text-center">
                  <ModalStatus
                    title={labels.error}
                    description={labels.errorDescription}
                  />
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-5 rounded-control bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong active:translate-y-px"
                  >
                    {labels.retry}
                  </button>
                </div>
              ) : null}

              {status === "ready" && details?.sources.length === 0 ? (
                <div className="py-10">
                  <ModalStatus
                    title={labels.empty}
                    description={labels.emptyDescription}
                  />
                </div>
              ) : null}

              {status === "ready" && details !== null ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {details.sources.slice(0, 3).map((source, index) => (
                    <article
                      key={`${source.title}-${index}`}
                      className="flex flex-col rounded-control border border-edge bg-surface-muted p-5"
                    >
                      {source.cropName !== null ? (
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent">
                          {source.cropName}
                        </p>
                      ) : null}
                      <h4 className="mt-2 font-display text-lg font-semibold leading-snug text-fg">
                        {source.title}
                      </h4>
                      <p className="mt-3 line-clamp-5 text-sm leading-6 text-fg-muted">
                        {source.content}
                      </p>
                      {source.sourceUrl !== null ? (
                        <a
                          href={source.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-5 inline-flex text-sm font-semibold text-accent hover:text-accent-strong"
                        >
                          {labels.source}
                        </a>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}

interface ModalStatusProps {
  title: string
  description: string
}

function ModalStatus({ title, description }: ModalStatusProps) {
  return (
    <div className="text-center">
      <p className="font-display text-lg font-semibold text-fg">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-fg-muted">
        {description}
      </p>
    </div>
  )
}
