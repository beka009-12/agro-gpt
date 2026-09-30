import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getDict } from "@/src/i18n/server"
import { handleApiError } from "@/src/lib/api-route-helpers"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import { fetchMyReviews } from "@/src/lib/reviews-server"

export async function GET(): Promise<NextResponse> {
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
    const reviews = await fetchMyReviews(token, {
      unavailable: ru.auth.errors.unavailable,
      checkData: ru.auth.errors.checkData,
    })
    if (!reviews) {
      return NextResponse.json(
        { message: ru.auth.errors.unexpectedResponse },
        { status: 502 }
      )
    }
    return NextResponse.json(reviews)
  } catch (error) {
    return handleApiError(error, ru, "[reviews:mine]")
  }
}
