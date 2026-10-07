import { describe, expect, test } from "bun:test"
import {
  loadMoreAction,
  loadMoreButtonVisibility,
  reviewItemVisibility,
} from "./reviews-load-more"

describe("loadMoreAction", () => {
  test("мобила: сначала раскрываем уже загруженные", () =>
    expect(
      loadMoreAction({ isMobile: true, mobileExpanded: false, loaded: 6, hasMore: true })
    ).toBe("reveal"))
  test("мобила после раскрытия — грузим следующую страницу", () =>
    expect(
      loadMoreAction({ isMobile: true, mobileExpanded: true, loaded: 6, hasMore: true })
    ).toBe("fetch"))
  test("десктоп сразу грузит", () =>
    expect(
      loadMoreAction({ isMobile: false, mobileExpanded: false, loaded: 6, hasMore: true })
    ).toBe("fetch"))
  test("мобила, загружено не больше трёх — раскрывать нечего", () =>
    expect(
      loadMoreAction({ isMobile: true, mobileExpanded: false, loaded: 3, hasMore: true })
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
  test("грузить нечего, но на мобиле есть скрытые — только мобила", () =>
    expect(loadMoreButtonVisibility({ mobileExpanded: false, loaded: 5, hasMore: false })).toBe(
      "mobile"
    ))
  test("всё показано — скрыта", () => {
    expect(loadMoreButtonVisibility({ mobileExpanded: true, loaded: 5, hasMore: false })).toBe(
      "none"
    )
    expect(loadMoreButtonVisibility({ mobileExpanded: false, loaded: 3, hasMore: false })).toBe(
      "none"
    )
  })
})

describe("reviewItemVisibility", () => {
  test("до раскрытия на мобиле видны первые три", () => {
    expect(reviewItemVisibility(2, false)).toBe("")
    expect(reviewItemVisibility(3, false)).toBe("max-md:hidden")
  })
  test("после раскрытия видны все", () => expect(reviewItemVisibility(5, true)).toBe(""))
})
