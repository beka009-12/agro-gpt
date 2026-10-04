import type { UpdateProfileRequest } from "@/src/api/generated/models"
import type { Locale } from "@/src/i18n/config"
import { apiFetch } from "@/src/lib/api-server"
import {
  getSyncedAiLanguage,
  setSyncedAiLanguage,
  type CookieStore,
} from "@/src/lib/auth-cookies"

// /diagnosis/ не принимает язык — бэк передаёт в Dify profile.language,
// поэтому язык профиля должен совпадать с языком UI. Ошибка не блокирует запрос.
export async function syncProfileLanguage(
  store: CookieStore,
  token: string,
  locale: Locale
): Promise<void> {
  try {
    const payload: UpdateProfileRequest = { language: locale }
    await apiFetch("/api/profile", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
    setSyncedAiLanguage(store, locale)
  } catch (error) {
    console.error("[profile-language] sync failed:", error)
  }
}

export async function ensureProfileLanguage(
  store: CookieStore,
  token: string,
  locale: Locale
): Promise<void> {
  if (getSyncedAiLanguage(store) === locale) return
  await syncProfileLanguage(store, token, locale)
}
