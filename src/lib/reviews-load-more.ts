/** На мобиле сначала три отзыва: шесть карточек подряд — слишком длинная прокрутка. */
export const MOBILE_INITIAL_REVIEWS = 3

/** Столько отзывов и меньше не прячем за «Показать ещё»: клик ради пары карточек того не стоит. */
export const REVIEWS_TAIL = 3

interface FeedState {
  mobileExpanded: boolean
  loaded: number
  hasMore: boolean
}

export type LoadMoreAction = "reveal" | "fetch" | "none"

/** Страница + хвост + 1: по лишнему отзыву понимаем, есть ли продолжение. */
export function reviewsFetchLimit(pageSize: number): number {
  return pageSize + REVIEWS_TAIL + 1
}

/** Короткий хвост показываем сразу, длинный — оставляем за кнопкой. */
export function takeReviewsPage<T>(fetched: T[], pageSize: number): { page: T[]; hasMore: boolean } {
  if (fetched.length <= pageSize + REVIEWS_TAIL) return { page: fetched, hasMore: false }
  return { page: fetched.slice(0, pageSize), hasMore: true }
}

/** Свёрнута ли лента на мобиле: только если за кнопкой окажется больше хвоста. */
export function isMobileCollapsed({ mobileExpanded, loaded, hasMore }: FeedState): boolean {
  if (mobileExpanded || loaded <= MOBILE_INITIAL_REVIEWS) return false
  return hasMore || loaded > MOBILE_INITIAL_REVIEWS + REVIEWS_TAIL
}

/** Что делает «Показать ещё»: на мобиле сначала раскрывает уже загруженные, потом грузит. */
export function loadMoreAction({
  isMobile,
  ...state
}: FeedState & { isMobile: boolean }): LoadMoreAction {
  if (isMobile && isMobileCollapsed(state)) return "reveal"
  return state.hasMore ? "fetch" : "none"
}

export function loadMoreButtonVisibility(state: FeedState): "all" | "mobile" | "none" {
  if (state.hasMore) return "all"
  return isMobileCollapsed(state) ? "mobile" : "none"
}

export function reviewItemVisibility(index: number, mobileCollapsed: boolean): string {
  return mobileCollapsed && index >= MOBILE_INITIAL_REVIEWS ? "max-md:hidden" : ""
}
