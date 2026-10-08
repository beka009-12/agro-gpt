"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { DURATION, EASE_OUT, REVEAL_OFFSET } from "@/src/lib/motion-tokens"

const STAGGER = 0.08

const GROUP_TAGS = { div: motion.div, ul: motion.ul, ol: motion.ol } as const
const ITEM_TAGS = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
} as const

const groupVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER } },
}

const itemVariants = {
  hidden: { opacity: 0, y: REVEAL_OFFSET },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE_OUT },
  },
}

interface RevealGroupProps {
  as?: keyof typeof GROUP_TAGS
  /** load — сразу при загрузке (hero), scroll — при появлении в окне */
  trigger?: "load" | "scroll"
  className?: string
  children: ReactNode
}

/** Родитель для RevealItem: задаёт stagger 0.08s. При reduced-motion всё видно сразу. */
export function RevealGroup({
  as = "div",
  trigger = "scroll",
  className,
  children,
}: RevealGroupProps) {
  const reduced = useReducedMotion()
  const Tag = GROUP_TAGS[as]

  if (reduced) return <Tag className={className}>{children}</Tag>

  return trigger === "load" ? (
    <Tag
      className={className}
      variants={groupVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </Tag>
  ) : (
    <Tag
      className={className}
      variants={groupVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </Tag>
  )
}

interface RevealItemProps {
  as?: keyof typeof ITEM_TAGS
  /**
   * Номер в догруженной пачке. Группа передаёт «visible» только детям, смонтированным
   * до срабатывания whileInView, — без этого новые элементы так и остались бы прозрачными.
   */
  appearIndex?: number
  className?: string
  children: ReactNode
}

export function RevealItem({ as = "div", appearIndex, className, children }: RevealItemProps) {
  const reduced = useReducedMotion()
  const Tag = ITEM_TAGS[as]

  if (appearIndex !== undefined) {
    return (
      <Tag
        className={className}
        initial={reduced ? false : itemVariants.hidden}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.slow, ease: EASE_OUT, delay: appearIndex * STAGGER }}
      >
        {children}
      </Tag>
    )
  }

  return (
    <Tag className={className} variants={itemVariants}>
      {children}
    </Tag>
  )
}
