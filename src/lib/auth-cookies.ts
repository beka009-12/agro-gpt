import type { cookies } from "next/headers"

export const TOKEN_COOKIE = "ibo_token"

// ibo_user больше не пишется; удаляем при logout, пока живы старые cookie
const LEGACY_USER_COOKIE = "ibo_user"

export type CookieStore = Awaited<ReturnType<typeof cookies>>

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7

function maxAgeFrom(expiresAt: string | undefined): number {
  if (!expiresAt) return DEFAULT_MAX_AGE
  const seconds = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
  return Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_MAX_AGE
}

export function setAuthCookies(
  store: CookieStore,
  params: { token: string; expiresAt?: string }
): void {
  store.set(TOKEN_COOKIE, params.token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeFrom(params.expiresAt),
    httpOnly: true,
  })
}

export function clearAuthCookies(store: CookieStore): void {
  store.delete(TOKEN_COOKIE)
  store.delete(LEGACY_USER_COOKIE)
}
