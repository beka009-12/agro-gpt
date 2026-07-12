import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { UserInputSchema } from "@/src/api/generated/models/userInputSchema"
import { getDict } from "@/src/i18n/server"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import { setAuthCookies, setLocaleCookie } from "@/src/lib/auth-cookies"
import {
  loginResponseSchema,
  makeRegisterFormSchema,
} from "@/src/lib/auth-schemas"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ru = await getDict()
  const apiMsgs = {
    unavailable: ru.auth.errors.unavailable,
    checkData: ru.auth.errors.checkData,
  }
  try {
    const body: unknown = await request.json().catch(() => null)
    const parsed = makeRegisterFormSchema(ru).safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    const { full_name, phone, email, region, language } = parsed.data
    const payload: UserInputSchema = {
      full_name,
      phone,
      language,
      email: email || null,
      region: region || null,
    }

    const data = await apiFetch(
      "/user/",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      apiMsgs
    )

    const login = loginResponseSchema.safeParse(data)
    if (!login.success) {
      console.error("[auth/register] unexpected API response:", data)
      return NextResponse.json(
        { message: ru.auth.errors.unexpectedResponse },
        { status: 502 }
      )
    }

    const store = await cookies()
    setAuthCookies(store, {
      token: login.data.access_token,
      expiresAt: login.data.expires_at,
      userId: login.data.user_id,
    })
    setLocaleCookie(store, language)

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      )
    }
    console.error("[auth/register]", error)
    return NextResponse.json(
      { message: ru.auth.errors.unavailable },
      { status: 500 }
    )
  }
}
