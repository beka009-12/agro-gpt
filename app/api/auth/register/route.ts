import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
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

    const { full_name, phone, email, password, language } = parsed.data
    const data = await apiFetch(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          full_name,
          phone,
          email: email || null,
          password,
          device_info: request.headers.get("user-agent"),
        }),
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

    // бэк не принимает language при регистрации — сохраняем отдельным
    // вызовом; ошибка здесь не должна ронять регистрацию
    try {
      await apiFetch(
        "/api/profile",
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${login.data.access_token}` },
          body: JSON.stringify({ language }),
        },
        apiMsgs
      )
    } catch (error) {
      console.error(
        "[auth/register] language patch failed (non-blocking):",
        error
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, errors: error.fieldErrors },
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
