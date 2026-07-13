"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"
import type { CSSProperties } from "react"

interface BenefitItem {
  title: string
  description: string
}

interface BenefitsCarouselProps {
  items: BenefitItem[]
  tapHint: string
}

const ADVANCE_MS = 3000

function cardStyle(position: number, total: number, reduced: boolean): CSSProperties {
  const base: CSSProperties = {
    transition: reduced
      ? "none"
      : "transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease",
  }
  if (position === 0) {
    return { ...base, transform: "translateY(0) scale(1)", opacity: 1, zIndex: 4 }
  }
  if (position === 1) {
    return { ...base, transform: "translateY(-16px) scale(0.94)", opacity: 0.55, zIndex: 3 }
  }
  if (position === 2) {
    return { ...base, transform: "translateY(-30px) scale(0.88)", opacity: 0.28, zIndex: 2 }
  }
  if (position === total - 1) {
    // уходящая вниз карточка — поверх стопки, пока не растворится
    return { ...base, transform: "translateY(48px) scale(0.97)", opacity: 0, zIndex: 5 }
  }
  return { ...base, transform: "translateY(-40px) scale(0.85)", opacity: 0, zIndex: 1 }
}

export function BenefitsCarousel({ items, tapHint }: BenefitsCarouselProps) {
  const [idx, setIdx] = useState(0)
  const reduced = useReducedMotion() ?? false
  const total = items.length

  useEffect(() => {
    if (reduced) return
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % total)
    }, ADVANCE_MS)
    return () => clearInterval(timer)
  }, [reduced, total])

  return (
    <div>
      <button
        type="button"
        onClick={() => setIdx((i) => (i + 1) % total)}
        aria-label={tapHint}
        className="relative block h-[210px] w-full cursor-pointer text-left"
      >
        {items.map((item, i) => {
          const position = (i - idx + total) % total
          return (
            <article
              key={item.title}
              aria-hidden={position !== 0}
              style={cardStyle(position, total, reduced)}
              className="absolute inset-x-0 top-0 rounded-[22px] border border-edge bg-card p-5 shadow-[0_10px_28px_rgba(6,78,59,0.08)]"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 flex-none place-items-center rounded-[13px] bg-mint-soft text-[13px] font-extrabold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[17px] font-extrabold text-fg">{item.title}</h3>
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-fg-muted">
                {item.description}
              </p>
            </article>
          )
        })}
      </button>
      <div className="mt-3 flex items-center justify-between">
        <span
          aria-live="polite"
          className="text-xs font-extrabold tracking-[0.08em] text-fg-faint"
        >
          {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="text-[11.5px] font-bold text-accent">{tapHint}</span>
      </div>
    </div>
  )
}
