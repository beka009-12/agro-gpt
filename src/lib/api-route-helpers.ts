import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ApiError } from "@/src/lib/api-server"
import { clearAuthCookies } from "@/src/lib/auth-cookies"
import type { Dictionary } from "@/src/i18n/dictionaries"

export async function handleApiError(
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
