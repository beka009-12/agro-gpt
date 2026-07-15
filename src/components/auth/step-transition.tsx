"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens"

interface StepTransitionProps {
  stepKey: number
  direction: 1 | -1
  children: ReactNode
}

export function StepTransition({
  stepKey,
  direction,
  children,
}: StepTransitionProps) {
  const reduced = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={reduced ? { opacity: 0 } : { x: 24 * direction, opacity: 0 }}
        animate={reduced ? { opacity: 1 } : { x: 0, opacity: 1 }}
        exit={reduced ? { opacity: 0 } : { x: -24 * direction, opacity: 0 }}
        transition={{ duration: DURATION.base, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
