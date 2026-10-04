import type { cookies } from "next/headers"
import { LOCALE_COOKIE, type Locale } from "@/src/i18n/config"

export const TOKEN_COOKIE = "ibo_token"
const USER_ID_COOKIE = "ibo_uid"

// ibo_user больше не пишется; удаляем при logout, пока живы старые cookie
const LEGACY_USER_COOKIE = "ibo_user"

// язык, который точно записан в профиль на бэке (по нему Dify выбирает язык ответа)
const AI_LANG_COOKIE = "ibo_ai_lang"

export type CookieStore = Awaited<ReturnType<typeof cookies>>

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7
const LOCALE_MAX_AGE = 60 * 60 * 24 * 365
// профиль общий для всех устройств юзера — короткий TTL, чтобы пересинкать,
// если язык поменяли с другого устройства
const AI_LANG_MAX_AGE = 60 * 60

function maxAgeFrom(expiresAt: string | undefined): number {
  if (!expiresAt) return DEFAULT_MAX_AGE
  const seconds = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
  return Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_MAX_AGE
}

export function setAuthCookies(
  store: CookieStore,
  params: { token: string; expiresAt?: string; userId?: string }
): void {
  const common = {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeFrom(params.expiresAt),
    httpOnly: true,
  }
  store.set(TOKEN_COOKIE, params.token, common)
  if (params.userId) store.set(USER_ID_COOKIE, params.userId, common)
}

export function setLocaleCookie(store: CookieStore, locale: Locale): void {
  store.set(LOCALE_COOKIE, locale, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: LOCALE_MAX_AGE,
    httpOnly: true,
  })
}

export function getSyncedAiLanguage(store: CookieStore): string | undefined {
  return store.get(AI_LANG_COOKIE)?.value
}

export function setSyncedAiLanguage(store: CookieStore, locale: Locale): void {
  store.set(AI_LANG_COOKIE, locale, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AI_LANG_MAX_AGE,
    httpOnly: true,
  })
}

export function clearAuthCookies(store: CookieStore): void {
  store.delete(TOKEN_COOKIE)
  store.delete(USER_ID_COOKIE)
  store.delete(LEGACY_USER_COOKIE)
  store.delete(AI_LANG_COOKIE)
}
