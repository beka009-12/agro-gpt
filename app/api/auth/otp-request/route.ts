import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import ru from "@/src/i18n/ru.json"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import { emailFormSchema } from "@/src/lib/auth-schemas"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json().catch(() => null)
    const parsed = emailFormSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    await apiFetch("/user/login/request", {
      method: "POST",
      body: JSON.stringify({ email: parsed.data.email }),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      )
    }
    console.error("[auth/otp-request]", error)
    return NextResponse.json(
      { message: ru.auth.errors.unavailable },
      { status: 500 }
    )
  }
}
