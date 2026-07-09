import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { UserInputSchema } from "@/src/api/generated/models/userInputSchema"
import ru from "@/src/i18n/ru.json"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import { setAuthCookies } from "@/src/lib/auth-cookies"
import { loginResponseSchema, registerFormSchema } from "@/src/lib/auth-schemas"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json().catch(() => null)
    const parsed = registerFormSchema.safeParse(body)
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

    const data = await apiFetch("/user/", {
      method: "POST",
      body: JSON.stringify(payload),
    })

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
      user: {
        full_name: login.data.full_name ?? full_name,
        language: login.data.language ?? language,
      },
    })

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
