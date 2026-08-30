import { z } from "zod"
import type {
  DiseaseDetailsResponseSchema,
  DiseaseMapResponseSchema,
} from "@/src/api/generated/models"
import { normalizeDiseaseNames } from "./disease-ranking"

export interface DiseaseMapPoint {
  diseaseName: string
  cropName: string | null
  createdAt: string
  longitude: number
  latitude: number
}

export interface DiseaseSource {
  title: string
  content: string
  sourceUrl: string | null
  cropName: string | null
}

export interface DiseaseDetails {
  diseaseName: string
  sources: DiseaseSource[]
}

const optionalTextSchema = z.string().trim().min(1).nullable().optional()

const diseaseMapFeatureSchema = z.object({
  type: z.string().optional(),
  geometry: z.object({
    type: z.string().optional(),
    coordinates: z.array(z.number()).min(2),
  }),
  properties: z.object({
    disease_name: z.string().trim().min(1),
    crop_name: optionalTextSchema,
    created_at: z.string().trim().min(1),
  }),
})

export const diseaseMapResponseSchema = z.object({
  type: z.string().optional(),
  features: z.array(diseaseMapFeatureSchema),
})

const diseaseDetailSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  source_url: z.url().nullable().optional(),
  crop_name: optionalTextSchema,
})

export const diseaseDetailsResponseSchema = z.object({
  disease_name: z.string().trim().min(1),
  sources: z.array(diseaseDetailSchema),
})

export const diseaseDetailsSchema: z.ZodType<DiseaseDetails> = z.object({
  diseaseName: z.string().trim().min(1),
  sources: z.array(
    z.object({
      title: z.string().trim().min(1),
      content: z.string().trim().min(1),
      sourceUrl: z.url().nullable(),
      cropName: z.string().trim().min(1).nullable(),
    })
  ),
})

function optionalText(value: string | null | undefined): string | null {
  return value?.trim() || null
}

export function normalizeDiseaseMap(
  response: DiseaseMapResponseSchema
): DiseaseMapPoint[] {
  return response.features.flatMap((feature) => {
    const [longitude, latitude] = feature.geometry.coordinates

    if (
      feature.geometry.type !== undefined &&
      feature.geometry.type !== "Point"
    ) {
      return []
    }

    if (
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      return []
    }

    return normalizeDiseaseNames(feature.properties.disease_name).map(
      (diseaseName) => ({
        diseaseName,
        cropName: optionalText(feature.properties.crop_name),
        createdAt: feature.properties.created_at,
        longitude,
        latitude,
      })
    )
  })
}

export function normalizeDiseaseDetails(
  response: DiseaseDetailsResponseSchema
): DiseaseDetails {
  return {
    diseaseName: response.disease_name.trim(),
    sources: response.sources.map((source) => ({
      title: source.title.trim().replace(/\s*\[[a-f\d]{8}\]\s*$/i, ""),
      content: source.content.trim(),
      sourceUrl: source.source_url ?? null,
      cropName: optionalText(source.crop_name),
    })),
  }
}
