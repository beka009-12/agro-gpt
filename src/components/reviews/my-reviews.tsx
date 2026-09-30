"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { useI18n } from "@/src/i18n/client"
import { myReviewSchema, type MyReview } from "@/src/lib/review-schemas"
import { ReviewCard } from "./review-card"

type State =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "ready"; reviews: MyReview[] }

interface MyReviewsProps {
  /** меняется после отправки нового отзыва — перезагружает список */
  refreshKey: number
}

export function MyReviews({ refreshKey }: MyReviewsProps) {
  const { dict, locale } = useI18n()
  const [state, setState] = useState<State>({ kind: "loading" })

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await fetch("/api/reviews/mine")
        const parsed = z
          .array(myReviewSchema)
          .safeParse(res.ok ? await res.json() : null)
        if (!alive) return
        setState(
          parsed.success
            ? { kind: "ready", reviews: parsed.data }
            : { kind: "error" }
        )
      } catch {
        if (alive) setState({ kind: "error" })
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [refreshKey])

  if (state.kind === "loading") {
    return <p className="text-fg-muted">{dict.reviews.loading}</p>
  }
  if (state.kind === "error") {
    return <p className="text-danger">{dict.reviews.loadError}</p>
  }
  if (state.reviews.length === 0) {
    return <p className="text-fg-muted">{dict.reviews.mineEmpty}</p>
  }
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {state.reviews.map((review) => (
        <li key={review.id}>
          <ReviewCard
            review={review}
            isAuthed
            labels={dict.reviews}
            locale={locale}
          />
        </li>
      ))}
    </ul>
  )
}
