import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { apiFetch } from "@/src/lib/api-server"
import { clearAuthCookies, TOKEN_COOKIE } from "@/src/lib/auth-cookies"

export async function POST(): Promise<NextResponse> {
  const store = await cookies()
  const token = store.get(TOKEN_COOKIE)?.value

  if (token) {
    try {
      await apiFetch(`/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (error) {
      console.error("[auth/logout] API error ignored:", error)
    }
  }

  clearAuthCookies(store)
  return NextResponse.json({ ok: true })
}
