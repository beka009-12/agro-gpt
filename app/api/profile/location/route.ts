import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { UpdateLocationRequest } from "@/src/api/generated/models"
import { getDict } from "@/src/i18n/server"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import { clearAuthCookies, TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import {
  locationDtoSchema,
  userProfileSchema,
} from "@/src/lib/profile-schemas"

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const ru = await getDict()
  const apiMsgs = {
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

    const body: unknown = await request.json().catch(() => null)
    const parsed = locationDtoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    const payload: UpdateLocationRequest = parsed.data
    const data = await apiFetch(
      "/api/profile/location",
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      },
      apiMsgs
    )

    const profile = userProfileSchema.safeParse(data)
    if (!profile.success) {
      console.error("[profile:location] unexpected response:", data)
      return NextResponse.json(
        { message: ru.auth.errors.unexpectedResponse },
        { status: 502 }
      )
    }
    return NextResponse.json(profile.data)
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const store = await cookies()
      clearAuthCookies(store)
      return NextResponse.json(
        { message: ru.auth.errors.unauthorized },
        { status: 401 }
      )
    }
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      )
    }
    console.error("[profile:location]", error)
    return NextResponse.json(
      { message: ru.auth.errors.unavailable },
      { status: 500 }
    )
  }
}
