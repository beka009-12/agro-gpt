import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDict } from "@/src/i18n/server"
import { apiFetch } from "@/src/lib/api-server"
import { handleApiError } from "@/src/lib/api-route-helpers"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import { fetchReviews, parseCreatedReview } from "@/src/lib/reviews-server"
import {
  REVIEW_MAX_PHOTOS,
  REVIEW_MAX_PHOTO_BYTES,
  REVIEW_PHOTO_TYPES,
  REVIEW_TEXT_MAX,
  REVIEW_TEXT_MIN,
} from "@/src/lib/review-schemas"

const MAX_LIMIT = 50

function intParam(value: string | null, fallback: number, max: number): number {
  const n = Number(value)
  return Number.isInteger(n) && n >= 0 ? Math.min(n, max) : fallback
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ru = await getDict()
  const msgs = {
    unavailable: ru.auth.errors.unavailable,
    checkData: ru.auth.errors.checkData,
  }
  try {
    const store = await cookies()
    const token = store.get(TOKEN_COOKIE)?.value
    const params = request.nextUrl.searchParams
    const limit = Math.max(1, intParam(params.get("limit"), 20, MAX_LIMIT))
    const offset = intParam(params.get("offset"), 0, 10_000)

    const reviews = await fetchReviews({ limit, offset, token }, msgs)
    if (!reviews) {
      return NextResponse.json(
        { message: ru.auth.errors.unexpectedResponse },
        { status: 502 }
      )
    }
    return NextResponse.json(reviews)
  } catch (error) {
    return handleApiError(error, ru, "[reviews:list]")
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ru = await getDict()
  const msgs = {
    unavailable: ru.auth.errors.unavailable,
    checkData: ru.auth.errors.checkData,
  }
  try {
    const store = await cookies()
    const token = store.get(TOKEN_COOKIE)?.value
    if (!token) {
      return NextResponse.json(
        { message: ru.auth.errors.unauthorized },
        { status: 401 }
      )
    }

    const incoming = await request.formData().catch(() => null)
    if (!incoming) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    const text = incoming.get("text")
    const trimmed = typeof text === "string" ? text.trim() : ""
    const photos = incoming
      .getAll("photos")
      .filter((f): f is File => f instanceof File && f.size > 0)
    const invalid =
      trimmed.length < REVIEW_TEXT_MIN ||
      trimmed.length > REVIEW_TEXT_MAX ||
      photos.length > REVIEW_MAX_PHOTOS ||
      photos.some(
        (f) =>
          !REVIEW_PHOTO_TYPES.includes(f.type) ||
          f.size > REVIEW_MAX_PHOTO_BYTES
      )
    if (invalid) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    // пересобираем форму: наружу уходят только известные поля
    const outgoing = new FormData()
    outgoing.set("text", trimmed)
    for (const key of ["crop", "place"] as const) {
      const value = incoming.get(key)
      if (typeof value === "string" && value.trim()) {
        outgoing.set(key, value.trim())
      }
    }
    for (const photo of photos) outgoing.append("photos", photo)

    const data = await apiFetch(
      "/reviews/",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: outgoing,
      },
      msgs
    )
    const review = parseCreatedReview(data)
    if (!review) {
      console.error("[reviews:create] unexpected response:", data)
      return NextResponse.json(
        { message: ru.auth.errors.unexpectedResponse },
        { status: 502 }
      )
    }
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    return handleApiError(error, ru, "[reviews:create]")
  }
}
