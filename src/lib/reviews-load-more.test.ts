import { describe, expect, test } from "bun:test"
import {
  isMobileCollapsed,
  loadMoreAction,
  loadMoreButtonVisibility,
  reviewItemVisibility,
  reviewsFetchLimit,
  takeReviewsPage,
} from "./reviews-load-more"

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

describe("takeReviewsPage", () => {
  test("запрашиваем страницу, хвост и один лишний", () => expect(reviewsFetchLimit(6)).toBe(10))
  test("хвост до трёх показываем сразу, без кнопки", () => {
    expect(takeReviewsPage(range(9), 6)).toEqual({ page: range(9), hasMore: false })
    expect(takeReviewsPage(range(7), 6)).toEqual({ page: range(7), hasMore: false })
    expect(takeReviewsPage(range(2), 6)).toEqual({ page: range(2), hasMore: false })
  })
  test("за кнопкой больше трёх — отдаём ровно страницу", () =>
    expect(takeReviewsPage(range(10), 6)).toEqual({ page: range(6), hasMore: true }))
})

describe("isMobileCollapsed", () => {
  test("скрыто не больше трёх — показываем всё", () => {
    expect(isMobileCollapsed({ mobileExpanded: false, loaded: 6, hasMore: false })).toBe(false)
    expect(isMobileCollapsed({ mobileExpanded: false, loaded: 3, hasMore: false })).toBe(false)
  })
  test("скрыто больше трёх или есть продолжение — сворачиваем", () => {
    expect(isMobileCollapsed({ mobileExpanded: false, loaded: 7, hasMore: false })).toBe(true)
    expect(isMobileCollapsed({ mobileExpanded: false, loaded: 6, hasMore: true })).toBe(true)
  })
  test("после раскрытия не сворачиваем", () =>
    expect(isMobileCollapsed({ mobileExpanded: true, loaded: 9, hasMore: true })).toBe(false))
})

describe("loadMoreAction", () => {
  test("мобила: сначала раскрываем уже загруженные", () =>
    expect(
      loadMoreAction({ isMobile: true, mobileExpanded: false, loaded: 6, hasMore: true })
    ).toBe("reveal"))
  test("мобила после раскрытия — грузим следующую страницу", () =>
    expect(
      loadMoreAction({ isMobile: true, mobileExpanded: true, loaded: 6, hasMore: true })
    ).toBe("fetch"))
  test("мобила, загружено не больше трёх — раскрывать нечего, грузим", () =>
    expect(
      loadMoreAction({ isMobile: true, mobileExpanded: false, loaded: 3, hasMore: true })
    ).toBe("fetch"))
  test("десктоп сразу грузит", () =>
    expect(
      loadMoreAction({ isMobile: false, mobileExpanded: false, loaded: 6, hasMore: true })
    ).toBe("fetch"))
  test("всё загружено и раскрыто — ничего", () =>
    expect(
      loadMoreAction({ isMobile: false, mobileExpanded: true, loaded: 6, hasMore: false })
    ).toBe("none"))
})

describe("loadMoreButtonVisibility", () => {
  test("есть что грузить — видна везде", () =>
    expect(loadMoreButtonVisibility({ mobileExpanded: false, loaded: 6, hasMore: true })).toBe(
      "all"
    ))
  test("грузить нечего, но на мобиле скрыто больше трёх — только мобила", () =>
    expect(loadMoreButtonVisibility({ mobileExpanded: false, loaded: 9, hasMore: false })).toBe(
      "mobile"
    ))
  test("скрыто три и меньше или всё показано — скрыта", () => {
    expect(loadMoreButtonVisibility({ mobileExpanded: false, loaded: 6, hasMore: false })).toBe(
      "none"
    )
    expect(loadMoreButtonVisibility({ mobileExpanded: true, loaded: 9, hasMore: false })).toBe(
      "none"
    )
  })
})

describe("reviewItemVisibility", () => {
  test("в свёрнутой ленте на мобиле видны первые три", () => {
    expect(reviewItemVisibility(2, true)).toBe("")
    expect(reviewItemVisibility(3, true)).toBe("max-md:hidden")
  })
  test("в развёрнутой видны все", () => expect(reviewItemVisibility(5, false)).toBe(""))
})
