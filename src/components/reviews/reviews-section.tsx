import { cookies } from "next/headers"
import { getDict } from "@/src/i18n/server"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import { REVIEWS_PREFETCH, splitLookahead } from "@/src/lib/reviews-load-more"
import { fetchReviews } from "@/src/lib/reviews-server"
import { SectionHeading } from "@/src/components/landing/section-heading"
import { SECTION_PADDING } from "@/src/components/landing/section-layout"
import { ReviewFormDialog } from "./review-form-dialog"
import { ReviewsFeed } from "./reviews-feed"

export async function ReviewsSection() {
  const [ru, store] = await Promise.all([getDict(), cookies()])
  const token = store.get(TOKEN_COOKIE)?.value
  // лендинг не должен падать из-за отзывов — при ошибке просто пустая лента
  const fetched =
    (await fetchReviews({ limit: REVIEWS_PREFETCH + 1, offset: 0, token }).catch(() => null)) ??
    []
  const { page, hasMore } = splitLookahead(fetched, REVIEWS_PREFETCH)

  return (
    <section
      id="reviews"
      className={`scroll-mt-24 bg-white ${SECTION_PADDING}`}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          compact
          eyebrow={ru.reviews.eyebrow}
          title={ru.reviews.title}
          action={<ReviewFormDialog isAuthed={Boolean(token)} />}
        />
        <ReviewsFeed
          initial={page}
          initialHasMore={hasMore}
          isAuthed={Boolean(token)}
        />
      </div>
    </section>
  )
}
