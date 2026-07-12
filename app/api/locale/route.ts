import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isLocale } from "@/src/i18n/config"
import { getDict } from "@/src/i18n/server"
import { apiFetch } from "@/src/lib/api-server"
import {
  setLocaleCookie,
  TOKEN_COOKIE,
  USER_ID_COOKIE,
} from "@/src/lib/auth-cookies"

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

  // залогинен и знаем user_id — синкаем язык ответов ИИ (не блокируя UI)
  const token = store.get(TOKEN_COOKIE)?.value
  const userId = store.get(USER_ID_COOKIE)?.value
  if (token && userId) {
    try {
      await apiFetch(`/user/${encodeURIComponent(userId)}/language`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ language }),
      })
    } catch (error) {
      console.error("[locale] language sync failed:", error)
    }
  }

  return NextResponse.json({ ok: true })
}
