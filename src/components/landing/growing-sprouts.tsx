"use client"

import { motion, useReducedMotion } from "motion/react"
import { SPROUT_GROW_DURATION, SPROUT_STAGGER } from "@/src/lib/motion-tokens"

interface SproutConfig {
  x: number
  height: number
  swayDuration: number
}

const SPROUTS: SproutConfig[] = [
  { x: 90, height: 130, swayDuration: 5.2 },
  { x: 220, height: 200, swayDuration: 4.4 },
  { x: 360, height: 150, swayDuration: 5.8 },
  { x: 500, height: 230, swayDuration: 4.8 },
  { x: 630, height: 120, swayDuration: 5.5 },
]

const BASE_Y = 300

function stemPath({ x, height }: SproutConfig): string {
  const topY = BASE_Y - height
  const c1y = BASE_Y - height * 0.45
  const c2y = BASE_Y - height * 0.7
  return `M ${x} ${BASE_Y} C ${x - 14} ${c1y}, ${x + 14} ${c2y}, ${x} ${topY}`
}

function leafPath(cx: number, cy: number, dir: 1 | -1): string {
  return [
    `M ${cx} ${cy}`,
    `C ${cx + 26 * dir} ${cy - 6}, ${cx + 34 * dir} ${cy - 28}, ${cx + 18 * dir} ${cy - 40}`,
    `C ${cx + 6 * dir} ${cy - 26}, ${cx} ${cy - 12}, ${cx} ${cy} Z`,
  ].join(" ")
}

interface GrowingSproutsProps {
  className?: string
}

export function GrowingSprouts({ className }: GrowingSproutsProps) {
  const reduced = useReducedMotion()

  return (
    <svg
      viewBox="0 0 720 320"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      className={className}
    >
      <line
        x1={24}
        y1={BASE_Y}
        x2={696}
        y2={BASE_Y}
        stroke="currentColor"
        strokeOpacity={0.25}
        strokeWidth={1.5}
      />
      {SPROUTS.map((sprout, i) => {
        const growDelay = i * SPROUT_STAGGER
        const leaves = [
          { cy: BASE_Y - sprout.height * 0.45, dir: 1 as const },
          { cy: BASE_Y - sprout.height * 0.65, dir: -1 as const },
        ]

        return (
          <motion.g
            key={sprout.x}
            initial={{ rotate: 0 }}
            animate={reduced ? undefined : { rotate: [0, 1.5, 0, -1.5, 0] }}
            transition={{
              duration: sprout.swayDuration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: growDelay + SPROUT_GROW_DURATION,
            }}
            style={{ transformBox: "fill-box", transformOrigin: "bottom center" }}
          >
            <motion.path
              d={stemPath(sprout)}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: SPROUT_GROW_DURATION,
                delay: growDelay,
                ease: "easeOut",
              }}
            />
            {leaves.map((leaf) => (
              <motion.path
                key={leaf.dir}
                d={leafPath(sprout.x, leaf.cy, leaf.dir)}
                fill="currentColor"
                fillOpacity={0.15}
                stroke="currentColor"
                strokeWidth={1.5}
                initial={reduced ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: growDelay + SPROUT_GROW_DURATION * 0.6,
                  ease: "backOut",
                }}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: leaf.dir === 1 ? "left bottom" : "right bottom",
                }}
              />
            ))}
          </motion.g>
        )
      })}
    </svg>
  )
}
