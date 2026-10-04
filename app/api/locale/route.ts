import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isLocale } from "@/src/i18n/config"
import { getDict } from "@/src/i18n/server"
import { setLocaleCookie, TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import { syncProfileLanguage } from "@/src/lib/profile-language"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const dict = await getDict()
  const body: unknown = await request.json().catch(() => null)
  const language =
    body !== null && typeof body === "object" && "language" in body
      ? body.language
      : null
  if (!isLocale(language)) {
    return NextResponse.json(
      { message: dict.auth.errors.checkData },
      { status: 400 }
    )
  }

  const store = await cookies()
  setLocaleCookie(store, language)

  const token = store.get(TOKEN_COOKIE)?.value
  if (token) await syncProfileLanguage(store, token, language)

  return NextResponse.json({ ok: true })
}
