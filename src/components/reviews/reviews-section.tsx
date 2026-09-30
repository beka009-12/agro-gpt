import Link from "next/link"
import { cookies } from "next/headers"
import { getDict, getLocale } from "@/src/i18n/server"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import { fetchReviews } from "@/src/lib/reviews-server"
import { ChevronRightIcon } from "@/src/components/ui/icons"
import { SectionHeading } from "@/src/components/landing/section-heading"
import { ReviewCard } from "./review-card"
import { ReviewFormDialog } from "./review-form-dialog"

const LANDING_LIMIT = 6

export async function ReviewsSection() {
  const [ru, locale, store] = await Promise.all([
    getDict(),
    getLocale(),
    cookies(),
  ])
  const token = store.get(TOKEN_COOKIE)?.value
  // лендинг не должен падать из-за отзывов — при ошибке просто пустая лента
  const reviews = await fetchReviews({ limit: LANDING_LIMIT, offset: 0, token }).catch(
    () => null
  )

  return (
    <section
      id="reviews"
      className="scroll-mt-24 bg-tan-soft px-5 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={ru.reviews.eyebrow} title={ru.reviews.title} />

        {reviews && reviews.length > 0 ? (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard
                  review={review}
                  isAuthed={Boolean(token)}
                  labels={ru.reviews}
                  locale={locale}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-fg-muted">{ru.reviews.empty}</p>
        )}

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <ReviewFormDialog isAuthed={Boolean(token)} />
          <Link
            href="/reviews"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent-strong hover:underline"
          >
            {ru.reviews.allLink}
            <ChevronRightIcon size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
