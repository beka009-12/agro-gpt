import { describe, expect, test } from "bun:test"
import {
  applyReaction,
  myReviewSchema,
  nextReaction,
  validateReviewForm,
} from "./review-schemas"

describe("nextReaction", () => {
  test("none -> like", () => expect(nextReaction(null, "like")).toBe("like"))
  test("like + like -> снять", () =>
    expect(nextReaction("like", "like")).toBeNull())
  test("like + dislike -> сменить", () =>
    expect(nextReaction("like", "dislike")).toBe("dislike"))
  test("dislike + dislike -> снять", () =>
    expect(nextReaction("dislike", "dislike")).toBeNull())
})

describe("applyReaction", () => {
  const base = { likes_count: 3, dislikes_count: 1, my_reaction: null } as const
  test("поставить лайк", () =>
    expect(applyReaction(base, "like")).toEqual({
      likes_count: 4,
      dislikes_count: 1,
      my_reaction: "like",
    }))
  test("сменить лайк на дизлайк", () =>
    expect(applyReaction({ ...base, my_reaction: "like" }, "dislike")).toEqual({
      likes_count: 2,
      dislikes_count: 2,
      my_reaction: "dislike",
    }))
  test("снять не уходит ниже нуля", () =>
    expect(
      applyReaction(
        { likes_count: 0, dislikes_count: 0, my_reaction: "like" },
        null
      ).likes_count
    ).toBe(0))
})

describe("validateReviewForm", () => {
  const ok = { text: "Хороший сервис, помог с болезнью", photos: [] }
  test("валидная форма", () => expect(validateReviewForm(ok)).toBeNull())
  test("короткий текст", () =>
    expect(validateReviewForm({ ...ok, text: " коротко " })).toBe("textLength"))
  test("6 фото", () =>
    expect(
      validateReviewForm({
        ...ok,
        photos: Array.from({ length: 6 }, () => ({ type: "image/png", size: 1 })),
      })
    ).toBe("tooManyPhotos"))
  test("gif", () =>
    expect(
      validateReviewForm({ ...ok, photos: [{ type: "image/gif", size: 1 }] })
    ).toBe("photoType"))
  test("тяжелее 10 МБ", () =>
    expect(
      validateReviewForm({
        ...ok,
        photos: [{ type: "image/png", size: 10 * 1024 * 1024 + 1 }],
      })
    ).toBe("photoSize"))
})

describe("myReviewSchema", () => {
  test("принимает ответ бэкенда со статусом", () => {
    const parsed = myReviewSchema.safeParse({
      id: crypto.randomUUID(),
      author_name: "Азамат",
      place: null,
      crop: "Томат",
      text: "Текст отзыва",
      photos: [],
      likes_count: 0,
      dislikes_count: 0,
      my_reaction: null,
      created_at: "2026-09-30T10:00:00Z",
      status: "pending",
    })
    expect(parsed.success).toBe(true)
  })
})
