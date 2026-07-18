"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/src/i18n/client"
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens"
import { AlertTriangleIcon, XIcon } from "@/src/components/ui/icons"

const DISMISS_KEY = "ibo_geo_banner_dismissed"

function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1"
  } catch {
    return false
  }
}

export function GeoWarningBanner() {
  const { dict } = useI18n()
  const reduceMotion = useReducedMotion()
  const [dismissed, setDismissed] = useState(readDismissed)

  if (dismissed) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // sessionStorage недоступен (privacy-режим) — скрываем только до ремаунта
    }
  }

  return (
    <motion.div
      role="alert"
      initial={reduceMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.fast, ease: EASE_OUT }}
      className="mx-4 mt-3 flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
    >
      <AlertTriangleIcon size={18} className="mt-0.5 flex-none" />
      <p className="flex-1">{dict.chat.geoWarning.text}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label={dict.chat.geoWarning.dismissLabel}
        className="grid size-6 flex-none place-items-center rounded-lg transition-colors hover:bg-danger/10"
      >
        <XIcon size={16} />
      </button>
    </motion.div>
  )
}
