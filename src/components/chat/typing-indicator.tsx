"use client"

import { motion, useReducedMotion } from "motion/react"

const DOT_DELAYS = [0, 0.15, 0.3]

export function TypingIndicator() {
  const reduced = useReducedMotion()

  return (
    <span className="flex items-center gap-1.5 rounded-[16px_16px_16px_4px] bg-mint-soft px-4.5 py-4">
      {DOT_DELAYS.map((delay) => (
        <motion.span
          key={delay}
          className="size-1.5 rounded-full bg-accent"
          animate={reduced ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay }}
        />
      ))}
    </span>
  )
}
