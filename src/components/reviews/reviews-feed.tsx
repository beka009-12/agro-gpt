"use client"

import { useState } from "react"
import { z } from "zod"
import { RevealGroup, RevealItem } from "@/src/components/landing/reveal"
import { Button } from "@/src/components/ui/button"
import { ChevronDownIcon } from "@/src/components/ui/icons"
import { useI18n } from "@/src/i18n/client"
import { reviewSchema, type Review } from "@/src/lib/review-schemas"
import {
  loadMoreAction,
  loadMoreButtonVisibility,
  reviewItemVisibility,
} from "@/src/lib/reviews-load-more"
import { ReviewCard } from "./review-card"

interface ReviewsFeedProps {
  initial: Review[]
  initialHasMore: boolean
  pageSize: number
  isAuthed: boolean
}

// совпадает с брейкпоинтом md в Tailwind (48rem)
const MOBILE_QUERY = "(max-width: 767.98px)"

export function ReviewsFeed({ initial, initialHasMore, pageSize, isAuthed }: ReviewsFeedProps) {
  const { dict, locale } = useI18n()
  const [reviews, setReviews] = useState<Review[]>(initial)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  async function fetchMore() {
    setLoading(true)
    setFailed(false)
    try {
      // на один больше страницы — так знаем, есть ли продолжение, без пустого клика в конце
      const res = await fetch(`/api/reviews?limit=${pageSize + 1}&offset=${reviews.length}`)
      const parsed = z.array(reviewSchema).safeParse(res.ok ? await res.json() : null)
      if (!parsed.success) {
        setFailed(true)
        return
      }
      const known = new Set(reviews.map((r) => r.id))
      const page = parsed.data.slice(0, pageSize).filter((r) => !known.has(r.id))
      setReviews([...reviews, ...page])
      setHasMore(parsed.data.length > pageSize && page.length > 0)
    } catch (error) {
      console.error("[reviews] load more failed:", error)
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  function handleLoadMore() {
    const action = loadMoreAction({
      isMobile: window.matchMedia(MOBILE_QUERY).matches,
      mobileExpanded,
      loaded: reviews.length,
      hasMore,
    })
    if (action === "none") return
    setMobileExpanded(true)
    if (action === "fetch") void fetchMore()
  }

  if (reviews.length === 0) {
    return <p className="text-fg-muted">{dict.reviews.empty}</p>
  }

  const buttonVisibility = loadMoreButtonVisibility({
    mobileExpanded,
    loaded: reviews.length,
    hasMore,
  })

  return (
    <div>
      <RevealGroup as="ul" className="grid items-start gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {reviews.map((review, i) => (
          <RevealItem as="li" key={review.id} className={reviewItemVisibility(i, mobileExpanded)}>
            <ReviewCard
              review={review}
              isAuthed={isAuthed}
              labels={dict.reviews}
              locale={locale}
            />
          </RevealItem>
        ))}
      </RevealGroup>

      {failed ? (
        <p role="alert" className="mt-6 text-center text-sm text-danger">
          {dict.reviews.loadError}
        </p>
      ) : null}

      {buttonVisibility !== "none" ? (
        <div
          className={`mt-8 flex justify-center ${buttonVisibility === "mobile" ? "md:hidden" : ""}`}
        >
          <Button
            variant="ghost"
            onClick={handleLoadMore}
            loading={loading}
            className="min-h-11 border border-edge px-6 text-fg hover:border-accent/40"
          >
            {failed ? dict.reviews.retry : dict.reviews.loadMore}
            {loading ? null : <ChevronDownIcon size={16} />}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
