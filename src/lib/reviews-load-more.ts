/** Сначала один ряд десктопной сетки. */
export const REVIEWS_INITIAL = 3
/** За клик — ещё два ряда. */
export const REVIEWS_STEP = 6

interface FeedState {
  visible: number
  loaded: number
  hasMore: boolean
}

export type FeedButton = "more" | "less" | "none"

/** Первая порция с сервера: стартовый ряд + следующий шаг, чтобы первый клик был мгновенным. */
export const REVIEWS_PREFETCH = REVIEWS_INITIAL + REVIEWS_STEP

/** Отдаёт size элементов; лишний сверху — признак, что есть продолжение. */
export function splitLookahead<T>(fetched: T[], size: number): { page: T[]; hasMore: boolean } {
  return { page: fetched.slice(0, size), hasMore: fetched.length > size }
}

export function feedButton({ visible, loaded, hasMore }: FeedState): FeedButton {
  if (loaded > visible || hasMore) return "more"
  return loaded > REVIEWS_INITIAL ? "less" : "none"
}

/** Чего не хватает до следующего шага; null — всё уже загружено. */
export function nextFetch({ visible, loaded, hasMore }: FeedState): { offset: number; size: number } | null {
  const target = visible + REVIEWS_STEP
  if (!hasMore || loaded >= target) return null
  return { offset: loaded, size: target - loaded }
}

/**
 * На md две колонки, а шаги нечётные (3, 9, 15): последнюю карточку там прячем,
 * чтобы не было дыры в ряду. В конце ленты не прячем — иначе отзыв не увидеть.
 */
export function reviewItemVisibility(index: number, state: FeedState): string {
  const { visible, loaded, hasMore } = state
  const hasNext = loaded > visible || hasMore
  return hasNext && visible % 2 === 1 && index === visible - 1 ? "md:max-lg:hidden" : ""
}
