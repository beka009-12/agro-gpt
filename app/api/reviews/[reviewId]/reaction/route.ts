import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDict } from "@/src/i18n/server"
import { apiFetch } from "@/src/lib/api-server"
import { handleApiError } from "@/src/lib/api-route-helpers"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import {
  reactionBodySchema,
  reviewReactionSchema,
} from "@/src/lib/review-schemas"
import { z } from "zod"

interface RouteContext {
  params: Promise<{ reviewId: string }>
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const ru = await getDict()
  try {
    const store = await cookies()
    const token = store.get(TOKEN_COOKIE)?.value
    if (!token) {
      return NextResponse.json(
        { message: ru.auth.errors.unauthorized },
        { status: 401 }
      )
    }

    const { reviewId } = await params
    const body = reactionBodySchema.safeParse(
      await request.json().catch(() => null)
    )
    if (!z.uuid().safeParse(reviewId).success || !body.success) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    const data = await apiFetch(
      `/reviews/${reviewId}/reaction`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(body.data),
      },
      {
        unavailable: ru.auth.errors.unavailable,
        checkData: ru.auth.errors.checkData,
      }
    )
    const parsed = reviewReactionSchema.safeParse(data)
    if (!parsed.success) {
      console.error("[reviews:reaction] unexpected response:", data)
      return NextResponse.json(
        { message: ru.auth.errors.unexpectedResponse },
        { status: 502 }
      )
    }
    return NextResponse.json(parsed.data)
  } catch (error) {
    return handleApiError(error, ru, "[reviews:reaction]")
  }
}
