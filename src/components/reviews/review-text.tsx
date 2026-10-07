"use client"

import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/src/i18n/client"

interface ReviewTextProps {
  text: string
}

/** Длинный отзыв свёрнут до 4 строк; кнопка появляется, только если текст правда обрезан. */
export function ReviewText({ text }: ReviewTextProps) {
  const { dict } = useI18n()
  const ref = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || expanded) return
    const measure = () => setClamped(el.scrollHeight > el.clientHeight + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [expanded, text])

  return (
    <div>
      <p
        ref={ref}
        className={`whitespace-pre-line break-words text-[15px] leading-6 text-fg ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {text}
      </p>
      {clamped || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-1 min-h-8 text-sm font-semibold text-accent-strong hover:underline"
        >
          {expanded ? dict.reviews.showLess : dict.reviews.readMore}
        </button>
      ) : null}
    </div>
  )
}
