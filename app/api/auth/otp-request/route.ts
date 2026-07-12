import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDict } from "@/src/i18n/server"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import { makeEmailFormSchema } from "@/src/lib/auth-schemas"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ru = await getDict()
  try {
    const body: unknown = await request.json().catch(() => null)
    const parsed = makeEmailFormSchema(ru).safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    await apiFetch(
      "/user/login/request",
      {
        method: "POST",
        body: JSON.stringify({ email: parsed.data.email }),
      },
      {
        unavailable: ru.auth.errors.unavailable,
        checkData: ru.auth.errors.checkData,
      }
    )

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
