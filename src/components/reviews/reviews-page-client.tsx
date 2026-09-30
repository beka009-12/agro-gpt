"use client"

import { useState } from "react"
import { useI18n } from "@/src/i18n/client"
import type { Review } from "@/src/lib/review-schemas"
import { MyReviews } from "./my-reviews"
import { ReviewFormDialog } from "./review-form-dialog"
import { ReviewsFeed } from "./reviews-feed"

type Tab = "all" | "mine"

interface ReviewsPageClientProps {
  initial: Review[]
  pageSize: number
  isAuthed: boolean
}

export function ReviewsPageClient({
  initial,
  pageSize,
  isAuthed,
}: ReviewsPageClientProps) {
  const { dict } = useI18n()
  const [tab, setTab] = useState<Tab>("all")
  const [refreshKey, setRefreshKey] = useState(0)

  const tabs: ReadonlyArray<{ id: Tab; label: string }> = [
    { id: "all", label: dict.reviews.tabAll },
    ...(isAuthed ? [{ id: "mine" as const, label: dict.reviews.tabMine }] : []),
  ]

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" className="flex gap-1 rounded-full bg-mint-soft p-1">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === id ? "bg-white text-accent-strong shadow-sm" : "text-fg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <ReviewFormDialog
          isAuthed={isAuthed}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
      </div>

      {tab === "all" ? (
        <ReviewsFeed initial={initial} pageSize={pageSize} isAuthed={isAuthed} />
      ) : (
        <MyReviews refreshKey={refreshKey} />
      )}
    </div>
  )
}
