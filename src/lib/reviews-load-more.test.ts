import { describe, expect, test } from "bun:test"
import {
  feedButton,
  nextFetch,
  reviewItemVisibility,
  splitLookahead,
} from "./reviews-load-more"

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

describe("splitLookahead", () => {
  test("лишний элемент — есть продолжение", () =>
    expect(splitLookahead(range(10), 9)).toEqual({ page: range(9), hasMore: true }))
  test("ровно страница или меньше — конец", () => {
    expect(splitLookahead(range(9), 9)).toEqual({ page: range(9), hasMore: false })
    expect(splitLookahead(range(2), 9)).toEqual({ page: range(2), hasMore: false })
  })
})

describe("feedButton", () => {
  test("загружено больше, чем показано, — «ещё», даже если осталось три", () =>
    expect(feedButton({ visible: 3, loaded: 6, hasMore: false })).toBe("more"))
  test("всё показано, но сервер отдаст ещё — «ещё»", () =>
    expect(feedButton({ visible: 9, loaded: 9, hasMore: true })).toBe("more"))
  test("всё показано и раскрыто — «свернуть»", () =>
    expect(feedButton({ visible: 9, loaded: 9, hasMore: false })).toBe("less"))
  test("шаг больше остатка — тоже «свернуть»", () =>
    expect(feedButton({ visible: 15, loaded: 11, hasMore: false })).toBe("less"))
  test("отзывов не больше стартового ряда — без кнопки", () =>
    expect(feedButton({ visible: 3, loaded: 3, hasMore: false })).toBe("none"))
})

describe("nextFetch", () => {
  test("следующий шаг уже загружен — не ходим в сеть", () =>
    expect(nextFetch({ visible: 3, loaded: 9, hasMore: true })).toBeNull())
  test("догружаем ровно недостающее", () =>
    expect(nextFetch({ visible: 9, loaded: 9, hasMore: true })).toEqual({ offset: 9, size: 6 }))
  test("сервер пуст — не грузим", () =>
    expect(nextFetch({ visible: 9, loaded: 9, hasMore: false })).toBeNull())
})

describe("reviewItemVisibility", () => {
  test("на md прячем непарную последнюю, пока есть продолжение", () => {
    expect(reviewItemVisibility(2, { visible: 3, loaded: 9, hasMore: false })).toBe(
      "md:max-lg:hidden"
    )
    expect(reviewItemVisibility(1, { visible: 3, loaded: 9, hasMore: false })).toBe("")
  })
  test("в конце ленты ничего не прячем", () =>
    expect(reviewItemVisibility(8, { visible: 9, loaded: 9, hasMore: false })).toBe(""))
})
