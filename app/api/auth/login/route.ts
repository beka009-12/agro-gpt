import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { LoginRequest } from "@/src/api/generated/models"
import { getDict } from "@/src/i18n/server"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import { setAuthCookies } from "@/src/lib/auth-cookies"
import {
  loginResponseSchema,
  makeLoginFormSchema,
} from "@/src/lib/auth-schemas"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ru = await getDict()
  const apiMsgs = {
    unavailable: ru.auth.errors.unavailable,
    checkData: ru.auth.errors.checkData,
  }
  try {
    const body: unknown = await request.json().catch(() => null)
    const parsed = makeLoginFormSchema(ru).safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data
    const payload: LoginRequest = {
      email,
      password,
      device_info: request.headers.get("user-agent"),
    }
    const data = await apiFetch(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      apiMsgs
    )

    const login = loginResponseSchema.safeParse(data)
    if (!login.success) {
      console.error("[auth/login] unexpected API response:", data)
      return NextResponse.json(
        { message: ru.auth.errors.unexpectedResponse },
        { status: 502 }
      )
    }

    const store = await cookies()
    setAuthCookies(store, {
      token: login.data.access_token,
      expiresAt: login.data.expires_at,
      userId: login.data.user.id,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, errors: error.fieldErrors },
        { status: error.status }
      )
    }
    console.error("[auth/login]", error)
    return NextResponse.json(
      { message: ru.auth.errors.unavailable },
      { status: 500 }
    )
  }
}
