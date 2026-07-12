import { cookies } from "next/headers"
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config"
import { getDictionary, type Dictionary } from "./dictionaries"

export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  const raw = store.get(LOCALE_COOKIE)?.value
  return isLocale(raw) ? raw : DEFAULT_LOCALE
}

export async function getDict(): Promise<Dictionary> {
  return getDictionary(await getLocale())
}
