import { z } from "zod"
import { apiFetch, type ApiMessages } from "@/src/lib/api-server"
import { myReviewSchema, reviewSchema } from "@/src/lib/review-schemas"
import type { MyReview, Review } from "@/src/lib/review-schemas"

// бэкенд может вернуть относительный путь к фото — приводим к абсолютному URL
function absolutePhotoUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url
  const base = process.env.API_URL ?? ""
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`
}

function withAbsolutePhotos<T extends { photos: { id: string; url: string }[] }>(
  review: T
): T {
  return {
    ...review,
    photos: review.photos.map((p) => ({ ...p, url: absolutePhotoUrl(p.url) })),
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
  return parsed.data.map(withAbsolutePhotos)
}

export async function fetchMyReviews(
  token: string,
  msgs?: ApiMessages
): Promise<MyReview[] | null> {
  const data = await apiFetch(
    "/reviews/mine",
    { headers: authHeaders(token) },
    msgs
  )
  const parsed = z.array(myReviewSchema).safeParse(data)
  if (!parsed.success) {
    console.error("[reviews:mine] unexpected response:", parsed.error.message)
    return null
  }
  return parsed.data.map(withAbsolutePhotos)
}

export function parseCreatedReview(data: unknown): MyReview | null {
  const parsed = myReviewSchema.safeParse(data)
  return parsed.success ? withAbsolutePhotos(parsed.data) : null
}
