import { describe, expect, test } from "bun:test"
import {
  normalizeTopDiseases,
  topDiseasesResponseSchema,
} from "./disease-ranking"

describe("normalizeTopDiseases", () => {
  test("merges confirmed casing and synonym variants", () => {
    const result = normalizeTopDiseases([
      { disease_name: "Фитофтороз", count: 9, is_fallback: false },
      { disease_name: "фитофтороз", count: 2, is_fallback: false },
      { disease_name: "Грушевая медяница", count: 8, is_fallback: false },
      {
        disease_name: "Грушевая медяница (Листоблошка)",
        count: 3,
        is_fallback: false,
      },
    ])

    expect(result).toEqual([
      { diseaseName: "Фитофтороз", count: 11, isFallback: false },
      { diseaseName: "Грушевая медяница", count: 11, isFallback: false },
    ])
  })

  test("adds a confirmed combined diagnosis to each disease", () => {
    const result = normalizeTopDiseases([
      { disease_name: "Фитофтороз", count: 9, is_fallback: false },
      { disease_name: "альтернариоз", count: 3, is_fallback: false },
      {
        disease_name: "фитофтороз, альтернариоз",
        count: 2,
        is_fallback: false,
      },
    ])

    expect(result).toEqual([
      { diseaseName: "Фитофтороз", count: 11, isFallback: false },
      { diseaseName: "Альтернариоз", count: 5, isFallback: false },
    ])
  })

  test("removes confirmed non-disease labels", () => {
    const result = normalizeTopDiseases([
      { disease_name: "Дефицит азота", count: 4, is_fallback: false },
      { disease_name: "грибковое поражение", count: 4, is_fallback: false },
      { disease_name: "пожелтение листьев", count: 3, is_fallback: false },
      { disease_name: "сорная растительность", count: 2, is_fallback: false },
      { disease_name: "септориоз", count: 7, is_fallback: false },
    ])

    expect(result).toEqual([
      { diseaseName: "Септориоз", count: 7, isFallback: false },
    ])
  })

  test("preserves an unknown label without guessing its meaning", () => {
    const result = normalizeTopDiseases([
      { disease_name: "  Новая болезнь  ", count: 2, is_fallback: false },
    ])

    expect(result).toEqual([
      { diseaseName: "Новая болезнь", count: 2, isFallback: false },
    ])
  })

  test("marks a merged disease as observed when any source is observed", () => {
    const result = normalizeTopDiseases([
      { disease_name: "Фитофтороз", count: 0, is_fallback: true },
      { disease_name: "фитофтороз", count: 2, is_fallback: false },
    ])

    expect(result).toEqual([
      { diseaseName: "Фитофтороз", count: 2, isFallback: false },
    ])
  })
})

describe("topDiseasesResponseSchema", () => {
  test("rejects a malformed API item before normalization", () => {
    const result = topDiseasesResponseSchema.safeParse([
      { disease_name: "Фитофтороз", count: "9", is_fallback: false },
    ])

    expect(result.success).toBeFalse()
  })

  test("rejects a blank disease name", () => {
    const result = topDiseasesResponseSchema.safeParse([
      { disease_name: "   ", count: 1, is_fallback: false },
    ])

    expect(result.success).toBeFalse()
  })

  test("rejects a count that is not a non-negative integer", () => {
    const negativeResult = topDiseasesResponseSchema.safeParse([
      { disease_name: "Фитофтороз", count: -1, is_fallback: false },
    ])
    const fractionalResult = topDiseasesResponseSchema.safeParse([
      { disease_name: "Фитофтороз", count: 1.5, is_fallback: false },
    ])

    expect(negativeResult.success).toBeFalse()
    expect(fractionalResult.success).toBeFalse()
  })
})
