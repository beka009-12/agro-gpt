"use client"

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react"
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

  const variants: Variants = {
    exit: reduced
      ? { opacity: 0 }
      : (dir: 1 | -1) => ({ x: -24 * dir, opacity: 0 }),
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        initial={reduced ? { opacity: 0 } : { x: 24 * direction, opacity: 0 }}
        animate={reduced ? { opacity: 1 } : { x: 0, opacity: 1 }}
        variants={variants}
        exit="exit"
        transition={{ duration: DURATION.base, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
