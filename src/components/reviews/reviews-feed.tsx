"use client"

import { useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import { z } from "zod"
import { RevealGroup, RevealItem } from "@/src/components/landing/reveal"
import { Button } from "@/src/components/ui/button"
import { ChevronDownIcon } from "@/src/components/ui/icons"
import { useI18n } from "@/src/i18n/client"
import { reviewSchema, type Review } from "@/src/lib/review-schemas"
import {
  REVIEWS_INITIAL,
  REVIEWS_STEP,
  feedButton,
  nextFetch,
  reviewItemVisibility,
  splitLookahead,
} from "@/src/lib/reviews-load-more"
import { ReviewCard } from "./review-card"

interface ReviewsFeedProps {
  initial: Review[]
  initialHasMore: boolean
  isAuthed: boolean
}

export function ReviewsFeed({ initial, initialHasMore, isAuthed }: ReviewsFeedProps) {
  const { dict, locale } = useI18n()
  const reduced = useReducedMotion()
  const listRef = useRef<HTMLDivElement>(null)
  const [reviews, setReviews] = useState<Review[]>(initial)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [visible, setVisible] = useState(REVIEWS_INITIAL)
  // с какого индекса началась последняя раскрытая пачка — от него считаем stagger
  const [batchStart, setBatchStart] = useState(REVIEWS_INITIAL)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  const state = { visible, loaded: reviews.length, hasMore }
  const button = feedButton(state)

  function expand() {
    setBatchStart(visible)
    setVisible(visible + REVIEWS_STEP)
  }

  async function showMore() {
    const missing = nextFetch(state)
    if (!missing) {
      expand()
      return
    }
    setLoading(true)
    setFailed(false)
    try {
      const res = await fetch(
        `/api/reviews?limit=${missing.size + 1}&offset=${missing.offset}`
      )
      const parsed = z.array(reviewSchema).safeParse(res.ok ? await res.json() : null)
      if (!parsed.success) {
        setFailed(true)
        return
      }
      const known = new Set(reviews.map((r) => r.id))
      const { page, hasMore: more } = splitLookahead(parsed.data, missing.size)
      const fresh = page.filter((r) => !known.has(r.id))
      setReviews([...reviews, ...fresh])
      setHasMore(more && fresh.length > 0)
      expand()
    } catch (error) {
      console.error("[reviews] load more failed:", error)
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  function collapse() {
    setVisible(REVIEWS_INITIAL)
    // лента резко укорачивается — без прокрутки читатель окажется в следующей секции
    const list = listRef.current
    if (list && list.getBoundingClientRect().top < 0) {
      const target = list.closest("section") ?? list
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" })
    }
  }

  if (reviews.length === 0) {
    return <p className="text-fg-muted">{dict.reviews.empty}</p>
  }

  return (
    <div ref={listRef} className="scroll-mt-24">
      <RevealGroup as="ul" className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {reviews.slice(0, visible).map((review, i) => (
          <RevealItem
            as="li"
            key={review.id}
            appearIndex={i >= REVIEWS_INITIAL ? Math.max(0, i - batchStart) : undefined}
            className={reviewItemVisibility(i, state)}
          >
            <ReviewCard review={review} isAuthed={isAuthed} locale={locale} />
          </RevealItem>
        ))}
      </RevealGroup>

      {failed ? (
        <p role="alert" className="mt-6 text-center text-sm text-danger">
          {dict.reviews.loadError}
        </p>
      ) : null}

      {button !== "none" ? (
        <div className="mt-8 flex justify-center">
          <Button
            variant="ghost"
            onClick={button === "more" ? () => void showMore() : collapse}
            loading={loading}
            className="min-h-11 border border-edge px-6 text-fg hover:border-accent/40"
          >
            {button === "less"
              ? dict.reviews.showLess
              : failed
                ? dict.reviews.retry
                : dict.reviews.loadMore}
            {loading ? null : (
              <ChevronDownIcon
                size={16}
                className={`transition-transform duration-200 motion-reduce:transition-none ${
                  button === "less" ? "rotate-180" : ""
                }`}
              />
            )}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
