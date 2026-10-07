import { z } from "zod"
import { apiFetch, type ApiMessages } from "@/src/lib/api-server"
import { myReviewSchema, reviewSchema } from "@/src/lib/review-schemas"
import type { MyReview, Review } from "@/src/lib/review-schemas"
import { toSameOriginPhotoUrl } from "@/src/lib/review-photo-url"

function withSameOriginPhotos<T extends { photos: { id: string; url: string }[] }>(
  review: T
): T {
  return {
    ...review,
    photos: review.photos.map((p) => ({
      ...p,
      url: toSameOriginPhotoUrl(p.url, process.env.API_URL),
    })),
  }
}

function authHeaders(token?: string): HeadersInit | undefined {
  return token ? { Authorization: `Bearer ${token}` } : undefined
}

export async function fetchReviews(
  params: { limit: number; offset: number; token?: string },
  msgs?: ApiMessages
): Promise<Review[] | null> {
  const query = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  })
  const data = await apiFetch(
    `/reviews/?${query.toString()}`,
    { headers: authHeaders(params.token), next: { revalidate: params.token ? 0 : 60 } },
    msgs
  )
  const parsed = z.array(reviewSchema).safeParse(data)
  if (!parsed.success) {
    console.error("[reviews:list] unexpected response:", parsed.error.message)
    return null
  }
  return parsed.data.map(withSameOriginPhotos)
}

export function parseCreatedReview(data: unknown): MyReview | null {
  const parsed = myReviewSchema.safeParse(data)
  return parsed.success ? withSameOriginPhotos(parsed.data) : null
}
