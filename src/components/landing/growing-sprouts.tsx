"use client"

import { motion, useReducedMotion } from "motion/react"
import { SPROUT_GROW_DURATION, SPROUT_STAGGER } from "@/src/lib/motion-tokens"

interface SproutConfig {
  x: number
  height: number
  swayDuration: number
}

const SPROUTS: SproutConfig[] = [
  { x: 60, height: 140, swayDuration: 5.2 },
  { x: 260, height: 200, swayDuration: 4.4 },
  { x: 480, height: 120, swayDuration: 5.8 },
  { x: 720, height: 230, swayDuration: 4.8 },
  { x: 960, height: 150, swayDuration: 5.5 },
  { x: 1160, height: 210, swayDuration: 4.2 },
  { x: 1360, height: 130, swayDuration: 6.0 },
]

const BASE_Y = 320

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
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className={className}
    >
      {SPROUTS.map((sprout, i) => {
        const growDelay = i * SPROUT_STAGGER
        const leaves = [
          { cy: BASE_Y - sprout.height * 0.45, dir: 1 as const },
          { cy: BASE_Y - sprout.height * 0.65, dir: -1 as const },
        ]

        return (
          <motion.g
            key={sprout.x}
            animate={reduced ? undefined : { rotate: [-1.5, 1.5, -1.5] }}
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
              stroke="#4ade80"
              strokeWidth={3}
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
                fill="#4ade80"
                fillOpacity={0.85}
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
