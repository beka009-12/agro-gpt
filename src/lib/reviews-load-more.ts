/** На мобиле сначала три отзыва: шесть карточек подряд — слишком длинная прокрутка. */
export const MOBILE_INITIAL_REVIEWS = 3

interface LoadMoreState {
  mobileExpanded: boolean
  loaded: number
  hasMore: boolean
}

export type LoadMoreAction = "reveal" | "fetch" | "none"

/** Что делает «Показать ещё»: на мобиле сначала раскрывает уже загруженные, потом грузит. */
export function loadMoreAction({
  isMobile,
  mobileExpanded,
  loaded,
  hasMore,
}: LoadMoreState & { isMobile: boolean }): LoadMoreAction {
  if (isMobile && !mobileExpanded && loaded > MOBILE_INITIAL_REVIEWS) return "reveal"
  return hasMore ? "fetch" : "none"
}

export function loadMoreButtonVisibility({
  mobileExpanded,
  loaded,
  hasMore,
}: LoadMoreState): "all" | "mobile" | "none" {
  if (hasMore) return "all"
  return !mobileExpanded && loaded > MOBILE_INITIAL_REVIEWS ? "mobile" : "none"
}

export function reviewItemVisibility(index: number, mobileExpanded: boolean): string {
  return !mobileExpanded && index >= MOBILE_INITIAL_REVIEWS ? "max-md:hidden" : ""
}
