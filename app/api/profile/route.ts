import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDict } from "@/src/i18n/server"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import { clearAuthCookies, TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import {
  makeProfileFormSchema,
  userProfileSchema,
} from "@/src/lib/profile-schemas"
import type { Dictionary } from "@/src/i18n/dictionaries"

async function handleApiError(
  error: unknown,
  ru: Dictionary,
  tag: string
): Promise<NextResponse> {
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
      { message: error.message, errors: error.fieldErrors },
      { status: error.status }
    )
  }
  console.error(tag, error)
  return NextResponse.json(
    { message: ru.auth.errors.unavailable },
    { status: 500 }
  )
}

export async function GET(): Promise<NextResponse> {
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
    const data = await apiFetch(
      "/api/profile",
      { headers: { Authorization: `Bearer ${token}` } },
      apiMsgs
    )
    const parsed = userProfileSchema.safeParse(data)
    if (!parsed.success) {
      console.error("[profile] unexpected /user/me response:", data)
      return NextResponse.json(
        { message: ru.auth.errors.unexpectedResponse },
        { status: 502 }
      )
    }
    return NextResponse.json(parsed.data)
  } catch (error) {
    return handleApiError(error, ru, "[profile:get]")
  }
}

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
    const parsed = makeProfileFormSchema(ru).safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    const { full_name, phone, email } = parsed.data
    const data = await apiFetch(
      "/api/profile",
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          full_name,
          phone,
          email: email || null,
        }),
      },
      apiMsgs
    )

    const profile = userProfileSchema.safeParse(data)
    if (!profile.success) {
      console.error("[profile] unexpected update response:", data)
      return NextResponse.json(
        { message: ru.auth.errors.unexpectedResponse },
        { status: 502 }
      )
    }
    return NextResponse.json(profile.data)
  } catch (error) {
    return handleApiError(error, ru, "[profile:patch]")
  }
}
