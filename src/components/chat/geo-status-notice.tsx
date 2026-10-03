"use client"

import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/src/i18n/client"
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens"
import { MapPinIcon } from "@/src/components/ui/icons"
import type { GeoStatus } from "./use-chat-geo"

interface GeoStatusNoticeProps {
  status: Extract<GeoStatus, "denied" | "unavailable" | "locating">
  onEnable: () => void
}

export function GeoStatusNotice({ status, onEnable }: GeoStatusNoticeProps) {
  const { dict } = useI18n()
  const reduceMotion = useReducedMotion()
  const copy = dict.chat.geoStatus
  const locating = status === "locating"

  return (
    <motion.div
      role="status"
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.fast, ease: EASE_OUT }}
      className="mb-2 flex items-center gap-2.5 rounded-xl border border-danger/25 bg-danger/5 px-3 py-2 text-xs text-danger"
    >
      <MapPinIcon size={16} className="flex-none" />
      <p className="min-w-0 flex-1 leading-snug">
        {status === "denied" ? copy.denied : copy.unavailable}
      </p>
      <button
        type="button"
        onClick={onEnable}
        disabled={locating}
        className="flex-none rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-danger shadow-[0_2px_8px_rgba(6,48,34,0.06)] transition-colors duration-150 hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:cursor-wait disabled:opacity-60"
      >
        {locating ? copy.locating : copy.enable}
      </button>
    </motion.div>
  )
}
