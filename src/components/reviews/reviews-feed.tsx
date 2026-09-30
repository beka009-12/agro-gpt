"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { useI18n } from "@/src/i18n/client"
import { reviewSchema, type Review } from "@/src/lib/review-schemas"
import { z } from "zod"
import { ReviewCard } from "./review-card"

interface ReviewsFeedProps {
  initial: Review[]
  pageSize: number
  isAuthed: boolean
}

export function ReviewsFeed({ initial, pageSize, isAuthed }: ReviewsFeedProps) {
  const { dict, locale } = useI18n()
  const [reviews, setReviews] = useState<Review[]>(initial)
  const [hasMore, setHasMore] = useState(initial.length >= pageSize)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  async function loadMore() {
    setLoading(true)
    setFailed(false)
    try {
      const res = await fetch(
        `/api/reviews?limit=${pageSize}&offset=${reviews.length}`
      )
      const parsed = z
        .array(reviewSchema)
        .safeParse(res.ok ? await res.json() : null)
      if (!parsed.success) {
        setFailed(true)
        return
      }
      const known = new Set(reviews.map((r) => r.id))
      setReviews([...reviews, ...parsed.data.filter((r) => !known.has(r.id))])
      setHasMore(parsed.data.length >= pageSize)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  if (reviews.length === 0) {
    return <p className="text-fg-muted">{dict.reviews.empty}</p>
  }

  return (
    <div>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <li key={review.id}>
            <ReviewCard
              review={review}
              isAuthed={isAuthed}
              labels={dict.reviews}
              locale={locale}
            />
          </li>
        ))}
      </ul>
      {failed ? (
        <p role="alert" className="mt-6 text-center text-sm text-danger">
          {dict.reviews.loadError}
        </p>
      ) : null}
      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <Button variant="ghost" onClick={() => void loadMore()} loading={loading}>
            {failed ? dict.reviews.retry : dict.reviews.loadMore}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
