import type { Locale } from "./config"
import ru from "./ru.json"
import en from "./en.json"
import ky from "./ky.json"

export type Dictionary = typeof ru

const DICTIONARIES: Record<Locale, Dictionary> = { ru, en, ky }

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}
