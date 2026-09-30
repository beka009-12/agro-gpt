import type { Metadata } from "next"
import { cookies } from "next/headers"
import { Footer } from "@/src/components/layout/footer"
import { Header } from "@/src/components/layout/header"
import { ReviewsPageClient } from "@/src/components/reviews/reviews-page-client"
import { getDict } from "@/src/i18n/server"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import { fetchReviews } from "@/src/lib/reviews-server"

const PAGE_SIZE = 20

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict()
  return {
    title: dict.reviews.pageTitle,
    description: dict.reviews.pageDescription,
    alternates: { canonical: "/reviews" },
  }
}

export default async function ReviewsPage() {
  const [ru, store] = await Promise.all([getDict(), cookies()])
  const token = store.get(TOKEN_COOKIE)?.value
  const initial =
    (await fetchReviews({ limit: PAGE_SIZE, offset: 0, token }).catch(() => null)) ??
    []

  return (
    <>
      <Header />
      <main className="bg-white px-5 pb-24 pt-28 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-10 font-display text-[36px] font-semibold leading-[1.08] tracking-[-0.035em] text-fg sm:text-[44px]">
            {ru.reviews.pageTitle}
          </h1>
          <ReviewsPageClient
            initial={initial}
            pageSize={PAGE_SIZE}
            isAuthed={Boolean(token)}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
