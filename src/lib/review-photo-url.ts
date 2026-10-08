/** Три превью + реакции влезают в одну строку карточки; остальное — счётчиком «+N». */
export const REVIEW_PHOTO_MAX_TILES = 3

/**
 * Фото отзывов отдаём с нашего origin (rewrite /media/reviews в next.config.ts):
 * бэкенд работает по http без TLS, и прямые ссылки на него HTTPS-страница блокирует как mixed content.
 */
export function toSameOriginPhotoUrl(url: string, apiUrl: string | undefined): string {
  try {
    const base = new URL(apiUrl ?? "http://backend.invalid")
    const resolved = new URL(url, base)
    return resolved.origin === base.origin ? resolved.pathname : url
  } catch {
    return url
  }
}

export function reviewPhotoTileCount(total: number): { tiles: number; hidden: number } {
  const tiles = Math.min(total, REVIEW_PHOTO_MAX_TILES)
  return { tiles, hidden: total - tiles }
}
