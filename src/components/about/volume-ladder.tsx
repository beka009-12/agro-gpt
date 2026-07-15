"use client"

import { motion, useReducedMotion } from "motion/react"
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens"

interface VolumeLadderProps {
  title: string
  sizes: string[]
  bulk: string
}

interface Bar {
  volume: string
  tag?: string
  height: number
  isBulk: boolean
}

/* высота канистры растёт вместе с объёмом: 1 → 5 → 10 → 20 → 1000 кг */
const SIZE_HEIGHTS = [56, 70, 84, 98]
const BULK_HEIGHT = 124

function splitVolume(value: string): [string, string] {
  const i = value.indexOf(" ")
  return i === -1 ? [value, ""] : [value.slice(0, i), value.slice(i + 1)]
}

function CanisterBar({ bar }: { bar: Bar }) {
  const [amount, unit] = splitVolume(bar.volume)
  return (
    <div className="flex flex-col items-center">
      <span
        aria-hidden
        className={`h-2 w-6 rounded-t-md ${bar.isBulk ? "bg-accent-strong" : "bg-mint"}`}
      />
      <div
        style={{ height: bar.height }}
        className={`relative flex w-full flex-col items-center justify-end overflow-hidden rounded-t-xl pb-2 ${
          bar.isBulk
            ? "bg-accent text-white"
            : "border border-b-0 border-mint bg-mint-soft text-deep"
        }`}
      >
        {bar.isBulk && (
          /* обрешётка IBC-куба */
          <span
            aria-hidden
            className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.14)_0,rgba(255,255,255,0.14)_1.5px,transparent_1.5px,transparent_15px),repeating-linear-gradient(90deg,rgba(255,255,255,0.14)_0,rgba(255,255,255,0.14)_1.5px,transparent_1.5px,transparent_15px)]"
          />
        )}
        {bar.tag && (
          <span className="relative rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-extrabold tracking-wide">
            {bar.tag}
          </span>
        )}
        <strong className="relative mt-1 text-[15px] font-extrabold leading-none">
          {amount}
        </strong>
        <span
          className={`relative mt-0.5 text-[10px] font-bold ${
            bar.isBulk ? "text-white/80" : "text-fg-muted"
          }`}
        >
          {unit}
        </span>
      </div>
    </div>
  )
}

export function VolumeLadder({ title, sizes, bulk }: VolumeLadderProps) {
  const reduced = useReducedMotion()
  const [bulkVolume, bulkTag] = bulk.split(" · ")
  const bars: Bar[] = [
    ...sizes.map((size, i) => ({
      volume: size,
      height: SIZE_HEIGHTS[Math.min(i, SIZE_HEIGHTS.length - 1)],
      isBulk: false,
    })),
    { volume: bulkVolume, tag: bulkTag, height: BULK_HEIGHT, isBulk: true },
  ]

  return (
    <div>
      <h3 className="text-sm font-extrabold text-fg">{title}</h3>
      <ul className="mt-4 flex items-end gap-1.5 overflow-hidden border-b-2 border-edge sm:gap-2.5">
        {bars.map((bar, i) =>
          reduced ? (
            <li key={bar.volume} className={bar.isBulk ? "min-w-0 flex-[1.3]" : "min-w-0 flex-1"}>
              <CanisterBar bar={bar} />
            </li>
          ) : (
            <motion.li
              key={bar.volume}
              className={bar.isBulk ? "min-w-0 flex-[1.3]" : "min-w-0 flex-1"}
              initial={{ y: "100%", opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: DURATION.base, ease: EASE_OUT, delay: i * 0.07 }}
            >
              <CanisterBar bar={bar} />
            </motion.li>
          ),
        )}
      </ul>
    </div>
  )
}
