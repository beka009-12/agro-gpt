import type { cookies } from "next/headers"

export const TOKEN_COOKIE = "ibo_token"
export const USER_COOKIE = "ibo_user"

export type CookieStore = Awaited<ReturnType<typeof cookies>>

export interface AuthUser {
  full_name: string
  language: string
}

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7

function maxAgeFrom(expiresAt: string | undefined): number {
  if (!expiresAt) return DEFAULT_MAX_AGE
  const seconds = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
  return Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_MAX_AGE
}

export function setAuthCookies(
  store: CookieStore,
  params: { token: string; expiresAt?: string; user: AuthUser }
): void {
  const common = {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeFrom(params.expiresAt),
  }
  store.set(TOKEN_COOKIE, params.token, { ...common, httpOnly: true })
  store.set(USER_COOKIE, JSON.stringify(params.user), {
    ...common,
    httpOnly: false,
  })
}

export function clearAuthCookies(store: CookieStore): void {
  store.delete(TOKEN_COOKIE)
  store.delete(USER_COOKIE)
}

export function parseAuthUser(raw: string | undefined): AuthUser | null {
  if (!raw) return null
  try {
    const data: unknown = JSON.parse(raw)
    if (
      data !== null &&
      typeof data === "object" &&
      "full_name" in data &&
      typeof data.full_name === "string"
    ) {
      const language =
        "language" in data && typeof data.language === "string"
          ? data.language
          : "ru"
      return { full_name: data.full_name, language }
    }
  } catch {
    // повреждённая cookie — считаем, что пользователя нет
  }
  return null
}
