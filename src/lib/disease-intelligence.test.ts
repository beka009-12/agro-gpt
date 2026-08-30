import { describe, expect, test } from "bun:test"
import {
  diseaseDetailsResponseSchema,
  diseaseMapResponseSchema,
  normalizeDiseaseDetails,
  normalizeDiseaseMap,
} from "./disease-intelligence"

describe("diseaseMapResponseSchema", () => {
  test("rejects malformed map features before normalization", () => {
    const result = diseaseMapResponseSchema.safeParse({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [74.6, "42.8"] },
          properties: {
            disease_name: "Фитофтороз",
            created_at: "2026-08-30T10:00:00Z",
          },
        },
      ],
    })

    expect(result.success).toBeFalse()
  })
})

describe("normalizeDiseaseMap", () => {
  test("filters invalid coordinates and confirmed non-disease labels", () => {
    const result = normalizeDiseaseMap({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [74.6, 42.8] },
          properties: {
            disease_name: "Фитофтороз",
            crop_name: "Томат",
            created_at: "2026-08-30T10:00:00Z",
          },
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [400, 42.8] },
          properties: {
            disease_name: "Септориоз",
            created_at: "2026-08-30T10:00:00Z",
          },
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [74.7, 42.9] },
          properties: {
            disease_name: "Дефицит азота",
            created_at: "2026-08-30T10:00:00Z",
          },
        },
      ],
    })

    expect(result).toEqual([
      {
        diseaseName: "Фитофтороз",
        cropName: "Томат",
        createdAt: "2026-08-30T10:00:00Z",
        longitude: 74.6,
        latitude: 42.8,
      },
    ])
  })

  test("creates a point for every disease in a confirmed combined diagnosis", () => {
    const result = normalizeDiseaseMap({
      features: [
        {
          geometry: { coordinates: [74.6, 42.8] },
          properties: {
            disease_name: "фитофтороз, альтернариоз",
            created_at: "2026-08-30T10:00:00Z",
          },
        },
      ],
    })

    expect(result.map((point) => point.diseaseName)).toEqual([
      "Фитофтороз",
      "Альтернариоз",
    ])
  })
})

describe("disease details", () => {
  test("rejects malformed sources", () => {
    const result = diseaseDetailsResponseSchema.safeParse({
      disease_name: "Фитофтороз",
      sources: [{ title: "Материал", content: 42 }],
    })

    expect(result.success).toBeFalse()
  })

  test("cleans generated title hashes and trims source content", () => {
    const result = normalizeDiseaseDetails({
      disease_name: "Фитофтороз",
      sources: [
        {
          title: "  Защита томатов [8fa31bc2]  ",
          content: "  Краткое описание материала.  ",
          source_url: "https://example.com/source",
          crop_name: "  Томат  ",
        },
      ],
    })

    expect(result).toEqual({
      diseaseName: "Фитофтороз",
      sources: [
        {
          title: "Защита томатов",
          content: "Краткое описание материала.",
          sourceUrl: "https://example.com/source",
          cropName: "Томат",
        },
      ],
    })
  })
})
