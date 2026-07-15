"use client"

import { useRef, useState } from "react"
import { AudienceIcon, type AudienceIconId } from "@/src/components/ui/icons"
import type { Dictionary } from "@/src/i18n/dictionaries"
import { SectionReveal } from "./section-reveal"

type AudienceItem = Dictionary["audience"]["items"][number]

const CARD_TONES = [
  { card: "bg-mint-soft", icon: "text-accent-strong", num: "text-[#8fae95]", iconBg: "bg-card" },
  { card: "bg-tan-soft", icon: "text-tan-strong", num: "text-[#b3ab8c]", iconBg: "bg-card" },
  {
    card: "border border-edge bg-card",
    icon: "text-accent",
    num: "text-[#c3bea6]",
    iconBg: "bg-bg",
  },
]

const SLIDE_GAP = 16

export function AudienceCards({ items }: { items: AudienceItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const slideStep = () => {
    const first = trackRef.current?.firstElementChild
    return first instanceof HTMLElement ? first.offsetWidth + SLIDE_GAP : 0
  }

  const handleScroll = () => {
    const el = trackRef.current
    const step = slideStep()
    if (!el || !step) return
    setActive(Math.min(items.length - 1, Math.round(el.scrollLeft / step)))
  }

  const scrollToSlide = (i: number) => {
    trackRef.current?.scrollTo({ left: i * slideStep(), behavior: "smooth" })
  }

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:items-stretch md:gap-5 md:overflow-visible"
      >
        {items.map((item, i) => {
          const tone = CARD_TONES[i % CARD_TONES.length]
          return (
            <SectionReveal
              key={i}
              delay={i * 0.08}
              className="w-full flex-none snap-start md:h-full md:w-auto"
            >
              <article
                className={`h-full rounded-[26px] p-6 transition-transform duration-200 hover:-translate-y-[5px] motion-reduce:transform-none md:p-7 ${tone.card}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`grid size-12 place-items-center rounded-2xl ${tone.iconBg}`}>
                    <AudienceIcon
                      id={item.icon as AudienceIconId}
                      size={23}
                      strokeWidth={1.8}
                      className={tone.icon}
                    />
                  </span>
                  <span className={`text-xs font-extrabold ${tone.num}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-extrabold tracking-tight text-fg">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  {item.description}
                </p>
              </article>
            </SectionReveal>
          )
        })}
      </div>

      <div className="mt-5 flex justify-center gap-1.5 md:hidden">
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            aria-label={item.title}
            aria-current={i === active}
            onClick={() => scrollToSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === active ? "w-5 bg-accent" : "w-1.5 bg-edge"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
