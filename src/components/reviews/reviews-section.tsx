import Link from "next/link"
import { cookies } from "next/headers"
import { getDict, getLocale } from "@/src/i18n/server"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import { fetchReviews } from "@/src/lib/reviews-server"
import { ChevronRightIcon } from "@/src/components/ui/icons"
import { SectionHeading } from "@/src/components/landing/section-heading"
import { SECTION_PADDING } from "@/src/components/landing/section-layout"
import { RevealGroup, RevealItem } from "@/src/components/landing/reveal"
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
      className={`scroll-mt-24 bg-white ${SECTION_PADDING}`}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading compact eyebrow={ru.reviews.eyebrow} title={ru.reviews.title} />

        {reviews && reviews.length > 0 ? (
          <RevealGroup as="ul" className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
            {reviews.map((review) => (
              <RevealItem as="li" key={review.id}>
                <ReviewCard
                  review={review}
                  isAuthed={Boolean(token)}
                  labels={ru.reviews}
                  locale={locale}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <p className="text-fg-muted">{ru.reviews.empty}</p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <ReviewFormDialog isAuthed={Boolean(token)} />
          <Link
            href="/reviews"
            className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent-strong hover:underline"
          >
            {ru.reviews.allLink}
            <ChevronRightIcon size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
