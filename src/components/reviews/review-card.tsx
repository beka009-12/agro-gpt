import type { Review } from "@/src/lib/review-schemas"
import { ReviewPhotos } from "./review-photos"
import { ReviewReactions } from "./review-reactions"
import { ReviewText } from "./review-text"

interface ReviewCardProps {
  review: Review
  isAuthed: boolean
  locale: string
}

export function ReviewCard({ review, isAuthed, locale }: ReviewCardProps) {
  const meta = [review.crop, review.place].filter(Boolean).join(" · ")
  const date = new Date(review.created_at).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <article className="flex h-full flex-col rounded-card border border-edge/70 bg-card p-4 sm:p-5">
      <header className="flex items-start gap-3">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft font-display text-sm font-semibold text-accent-strong"
        >
          {review.author_name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-[15px] font-semibold leading-5 text-fg">
              {review.author_name}
            </p>
            <time
              dateTime={review.created_at}
              className="shrink-0 text-xs leading-5 text-fg-faint"
            >
              {date}
            </time>
          </div>
          {meta ? (
            <p className="mt-0.5 truncate text-sm leading-5 text-fg-muted">{meta}</p>
          ) : null}
        </div>
      </header>

      <div className="mt-2.5">
        <ReviewText text={review.text} />
      </div>

      {/* фото и реакции в одной строке: справа от превью иначе пусто */}
      <footer className="-mb-2 mt-auto flex items-end gap-2 pt-3">
        {review.photos.length > 0 ? (
          <div className="min-w-0 flex-1 pb-2">
            <ReviewPhotos photos={review.photos} />
          </div>
        ) : null}
        <ReviewReactions
          reviewId={review.id}
          isAuthed={isAuthed}
          className="-mr-3 ml-auto shrink-0"
          initial={{
            likes_count: review.likes_count,
            dislikes_count: review.dislikes_count,
            my_reaction: review.my_reaction,
          }}
        />
      </footer>
    </article>
  )
}
