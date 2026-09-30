"use client"

import { useEffect, useRef, useState } from "react"
import {
  motion,
  useInView,
  useReducedMotion,
  type PanInfo,
  type TargetAndTransition,
} from "motion/react"
import { AboutIcon, type AboutIconId } from "@/src/components/ui/icons"
import { useI18n } from "@/src/i18n/client"
import type { Dictionary } from "@/src/i18n/dictionaries"
import { DURATION, EASE_OUT, SPRING_SNAPPY } from "@/src/lib/motion-tokens"

type BenefitItem = Dictionary["about"]["benefits"]["items"][number]
type Direction = "next" | "prev"

const AUTOPLAY_MS = 4500
const SWIPE_DISTANCE = 60
const SWIPE_VELOCITY = 400

// положение карточки по её месту в стопке: 0 — верхняя
const STACK_POSITIONS: TargetAndTransition[] = [
  { x: 0, y: 0, scale: 1, opacity: 1 },
  { x: 0, y: 10, scale: 0.95, opacity: 0.75 },
  { x: 0, y: 20, scale: 0.9, opacity: 0.45 },
]
const HIDDEN: TargetAndTransition = { x: 0, y: 20, scale: 0.9, opacity: 0 }
// верхняя карточка улетает влево и остаётся в конце стопки
const LEAVING: TargetAndTransition = {
  x: [0, -140, 0],
  y: [0, 0, 20],
  scale: [1, 1, 0.9],
  opacity: [1, 0, 0],
}

/** Стопка карточек для телефона: сама листается, смахивается и ставится на паузу. */
export function BenefitsStack({ items }: { items: BenefitItem[] }) {
  const { dict } = useI18n()
  const labels = dict.about.benefits.controls
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { margin: "-20% 0px" })

  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<Direction>("next")
  const [holding, setHolding] = useState(false)
  const [tabVisible, setTabVisible] = useState(true)

  const count = items.length
  const autoplay = !reduced && !holding && inView && tabVisible

  const go = (dir: Direction) => {
    setDirection(dir)
    setIndex((i) => (dir === "next" ? (i + 1) % count : (i - 1 + count) % count))
  }

  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState === "visible")
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  // таймер привязан к index: ручной переход сбрасывает отсчёт
  useEffect(() => {
    if (!autoplay || count < 2) return
    const timer = window.setTimeout(() => {
      setDirection("next")
      setIndex((i) => (i + 1) % count)
    }, AUTOPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [autoplay, index, count])

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) {
      go("next")
    } else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) {
      go("prev")
    }
  }

  const animateFor = (position: number): TargetAndTransition => {
    if (reduced) return { opacity: position === 0 ? 1 : 0 }
    if (position < STACK_POSITIONS.length) return STACK_POSITIONS[position]
    if (position === count - 1 && direction === "next") return LEAVING
    return HIDDEN
  }

  const transitionFor = (position: number) =>
    reduced
      ? { duration: DURATION.fast }
      : position === count - 1 && direction === "next"
        ? { duration: DURATION.slow, ease: EASE_OUT }
        : SPRING_SNAPPY

  return (
    <div
      ref={rootRef}
      role="group"
      aria-roledescription="carousel"
      aria-label={labels.label}
      onPointerDown={() => setHolding(true)}
      onPointerUp={() => setHolding(false)}
      onPointerCancel={() => setHolding(false)}
      onFocus={() => setHolding(true)}
      onBlur={() => setHolding(false)}
    >
      <div
        aria-live={autoplay ? "off" : "polite"}
        className="grid pb-6 [&>*]:col-start-1 [&>*]:row-start-1"
      >
        {items.map((item, i) => {
          const position = (i - index + count) % count
          const top = position === 0
          return (
            <motion.article
              key={item.title}
              initial={false}
              animate={animateFor(position)}
              transition={transitionFor(position)}
              drag={top && !reduced ? "x" : false}
              dragSnapToOrigin
              dragElastic={0.6}
              onDragEnd={handleDragEnd}
              aria-hidden={!top}
              inert={!top}
              style={{ zIndex: count - position, touchAction: "pan-y" }}
              className="rounded-card border border-edge bg-white p-5 shadow-[0_6px_20px_rgba(13,59,41,0.06)]"
            >
              <span className="grid size-12 place-items-center rounded-control bg-accent-soft text-accent-strong">
                <AboutIcon
                  id={item.icon as AboutIconId}
                  size={22}
                  strokeWidth={1.8}
                />
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold leading-tight tracking-[-0.02em] text-fg">
                {item.title}
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-fg-muted">
                {item.description}
              </p>
            </motion.article>
          )
        })}
      </div>

      <div aria-hidden className="flex items-center justify-center gap-1.5">
        {items.map((item, i) => (
          <span
            key={item.title}
            className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ${
              i === index ? "w-5 bg-accent" : "w-1.5 bg-edge"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
