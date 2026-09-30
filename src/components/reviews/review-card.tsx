import type { Dictionary } from "@/src/i18n/dictionaries"
import type { MyReview, Review } from "@/src/lib/review-schemas"
import { ReviewReactions } from "./review-reactions"

interface ReviewCardProps {
  review: Review | MyReview
  isAuthed: boolean
  labels: Dictionary["reviews"]
  locale: string
}

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-800",
  approved: "bg-mint-soft text-accent-strong",
  rejected: "bg-red-50 text-danger",
} as const

export function ReviewCard({ review, isAuthed, labels, locale }: ReviewCardProps) {
  const meta = [review.crop, review.place].filter(Boolean).join(" · ")
  const date = new Date(review.created_at).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <article className="flex h-full flex-col rounded-card border border-edge/60 bg-card p-7 sm:p-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            aria-hidden
            className="grid size-11 shrink-0 place-items-center rounded-full bg-mint-soft font-display text-base font-semibold text-accent-strong"
          >
            {review.author_name.trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-semibold text-fg">
              {review.author_name}
            </p>
            {meta ? (
              <p className="mt-0.5 truncate text-sm text-fg-muted">{meta}</p>
            ) : null}
          </div>
        </div>
        {"status" in review ? (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[review.status]}`}
          >
            {labels.status[review.status]}
          </span>
        ) : null}
      </header>

      <p className="mt-6 whitespace-pre-line break-words text-base leading-7 text-fg">
        {review.text}
      </p>

      {review.photos.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-3">
          {review.photos.map((photo) => (
            <li key={photo.id}>
              <a href={photo.url} target="_blank" rel="noopener noreferrer">
                {/* внешний хост бэкенда — без next/image, чтобы не плодить remotePatterns */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={labels.photoAlt}
                  loading="lazy"
                  className="size-20 rounded-xl border border-edge/60 object-cover"
                />
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-edge/60 pt-5">
        <ReviewReactions
          reviewId={review.id}
          isAuthed={isAuthed}
          initial={{
            likes_count: review.likes_count,
            dislikes_count: review.dislikes_count,
            my_reaction: review.my_reaction,
          }}
        />
        <time dateTime={review.created_at} className="text-xs text-fg-faint">
          {date}
        </time>
      </footer>
    </article>
  )
}
