import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { ResetPasswordRequest } from "@/src/api/generated/models"
import { getDict } from "@/src/i18n/server"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import { makeResetPasswordFormSchema } from "@/src/lib/auth-schemas"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ru = await getDict()
  try {
    const body: unknown = await request.json().catch(() => null)
    const parsed = makeResetPasswordFormSchema(ru).safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    const { email, reset_code, new_password } = parsed.data
    const payload: ResetPasswordRequest = { email, reset_code, new_password }
    await apiFetch(
      "/api/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify(payload),
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
        { message: error.message, errors: error.fieldErrors },
        { status: error.status }
      )
    }
    console.error("[auth/reset-password]", error)
    return NextResponse.json(
      { message: ru.auth.errors.unavailable },
      { status: 500 }
    )
  }
}
