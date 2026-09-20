"use client"

import { useEffect, useRef, useState } from "react"
import { AboutIcon, type AboutIconId } from "@/src/components/ui/icons"
import type { Dictionary } from "@/src/i18n/dictionaries"

type BenefitItem = Dictionary["about"]["benefits"]["items"][number]

type Edge = "start" | "middle" | "end" | "none"

const MASK_BY_EDGE: Record<Edge, string> = {
  start:
    "[mask-image:linear-gradient(to_right,black_82%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_82%,transparent_100%)]",
  end: "[mask-image:linear-gradient(to_left,black_82%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_left,black_82%,transparent_100%)]",
  middle:
    "[mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]",
  none: "[mask-image:none] [-webkit-mask-image:none]",
}

export function BenefitsCarousel({ items }: { items: BenefitItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState<Edge>("start")

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const updateEdge = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el
      const maxScroll = scrollWidth - clientWidth

      if (maxScroll <= 1) {
        setEdge("none")
      } else if (scrollLeft <= 4) {
        setEdge("start")
      } else if (scrollLeft >= maxScroll - 4) {
        setEdge("end")
      } else {
        setEdge("middle")
      }
    }

    updateEdge()
    el.addEventListener("scroll", updateEdge, { passive: true })
    window.addEventListener("resize", updateEdge)
    return () => {
      el.removeEventListener("scroll", updateEdge)
      window.removeEventListener("resize", updateEdge)
    }
  }, [])

  return (
    <div
      ref={trackRef}
      className={`no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scroll-padding-inline:1.25rem] transition-[mask-image] duration-200 md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 md:![mask-image:none] md:![-webkit-mask-image:none] lg:grid-cols-4 lg:gap-6 ${MASK_BY_EDGE[edge]}`}
    >
      {items.map((item) => (
        <article
          key={item.title}
          className="group w-[88%] shrink-0 snap-start rounded-card border border-edge bg-white p-7 transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-accent/40 sm:w-[62%] sm:p-8 md:w-auto md:shrink"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-control bg-accent-soft text-accent-strong transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
            <AboutIcon id={item.icon as AboutIconId} size={24} strokeWidth={1.8} />
          </span>
          <h3 className="mt-7 font-display text-xl font-semibold tracking-[-0.02em] text-fg">
            {item.title}
          </h3>
          <p className="mt-4 text-[15px] leading-7 text-fg-muted">
            {item.description}
          </p>
        </article>
      ))}
    </div>
  )
}
