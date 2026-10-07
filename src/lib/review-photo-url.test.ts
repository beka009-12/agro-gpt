import { describe, expect, test } from "bun:test"
import { toSameOriginPhotoUrl } from "./review-photo-url"

const API = "http://167.233.203.129"

describe("toSameOriginPhotoUrl", () => {
  test("относительный путь бэкенда остаётся путём на нашем origin", () =>
    expect(toSameOriginPhotoUrl("/media/reviews/a.jpg", API)).toBe(
      "/media/reviews/a.jpg"
    ))
  test("путь без ведущего слэша", () =>
    expect(toSameOriginPhotoUrl("media/reviews/a.jpg", API)).toBe(
      "/media/reviews/a.jpg"
    ))
  test("абсолютный http-URL бэкенда превращается в путь", () =>
    expect(
      toSameOriginPhotoUrl("http://167.233.203.129/media/reviews/a.jpg", API)
    ).toBe("/media/reviews/a.jpg"))
  test("API_URL со слэшем в конце", () =>
    expect(
      toSameOriginPhotoUrl("http://167.233.203.129/media/reviews/a.jpg", `${API}/`)
    ).toBe("/media/reviews/a.jpg"))
  test("чужой https-URL не трогаем", () =>
    expect(toSameOriginPhotoUrl("https://cdn.example.com/a.jpg", API)).toBe(
      "https://cdn.example.com/a.jpg"
    ))
  test("без API_URL относительный путь всё равно с ведущим слэшем", () =>
    expect(toSameOriginPhotoUrl("media/reviews/a.jpg", undefined)).toBe(
      "/media/reviews/a.jpg"
    ))
})
