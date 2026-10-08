import { cookies } from "next/headers"
import { getDict } from "@/src/i18n/server"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import { reviewsFetchLimit, takeReviewsPage } from "@/src/lib/reviews-load-more"
import { fetchReviews } from "@/src/lib/reviews-server"
import { SectionHeading } from "@/src/components/landing/section-heading"
import { SECTION_PADDING } from "@/src/components/landing/section-layout"
import { ReviewFormDialog } from "./review-form-dialog"
import { ReviewsFeed } from "./reviews-feed"

const PAGE_SIZE = 6

export async function ReviewsSection() {
  const [ru, store] = await Promise.all([getDict(), cookies()])
  const token = store.get(TOKEN_COOKIE)?.value
  // лендинг не должен падать из-за отзывов — при ошибке просто пустая лента
  const fetched =
    (await fetchReviews({ limit: reviewsFetchLimit(PAGE_SIZE), offset: 0, token }).catch(
      () => null
    )) ?? []
  const { page, hasMore } = takeReviewsPage(fetched, PAGE_SIZE)

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
          pageSize={PAGE_SIZE}
          isAuthed={Boolean(token)}
        />
      </div>
    </section>
  )
}
