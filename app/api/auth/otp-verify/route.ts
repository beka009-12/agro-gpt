import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import ru from "@/src/i18n/ru.json"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import { isLocale } from "@/src/i18n/config"
import { setAuthCookies, setLocaleCookie } from "@/src/lib/auth-cookies"
import { loginResponseSchema, otpVerifyDtoSchema } from "@/src/lib/auth-schemas"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json().catch(() => null)
    const parsed = otpVerifyDtoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    const data = await apiFetch("/user/login/verify", {
      method: "POST",
      body: JSON.stringify({
        email: parsed.data.email,
        otp_code: parsed.data.otp_code,
        device_info: request.headers.get("user-agent"),
      }),
    })

    const login = loginResponseSchema.safeParse(data)
    if (!login.success) {
      console.error("[auth/otp-verify] unexpected API response:", data)
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
    if (isLocale(login.data.language)) {
      setLocaleCookie(store, login.data.language)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      )
    }
    console.error("[auth/otp-verify]", error)
    return NextResponse.json(
      { message: ru.auth.errors.unavailable },
      { status: 500 }
    )
  }
}
