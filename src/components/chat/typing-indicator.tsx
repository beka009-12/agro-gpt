"use client"

import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/src/i18n/client"
import { PlantIcon } from "@/src/components/ui/icons"

export function TypingIndicator() {
  const { dict: ru } = useI18n()
  const reduced = useReducedMotion()

  return (
    <div className="flex max-w-[400px] items-center gap-3 rounded-[18px] border border-[#dfeddf] bg-[#f4faf3] p-4">
      <motion.span
        aria-hidden
        className="grid size-[42px] flex-none place-items-center rounded-[14px] bg-[#dcfce7] text-accent"
        animate={
          reduced
            ? undefined
            : {
                scale: [1, 1.06, 1],
                boxShadow: [
                  "0 0 0 0 rgba(22,163,74,0.1)",
                  "0 0 0 9px rgba(22,163,74,0.06)",
                  "0 0 0 0 rgba(22,163,74,0.1)",
                ],
              }
        }
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <PlantIcon size={22} strokeWidth={1.8} />
      </motion.span>
      <div>
        <p className="text-[13px] font-extrabold text-[#214434]">
          {ru.chat.typingTitle}
        </p>
        <p className="mt-0.5 text-[11px] text-fg-muted">{ru.chat.typingSubtitle}</p>
      </div>
    </div>
  )
}
