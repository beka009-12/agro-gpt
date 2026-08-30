import "server-only"
import { apiFetch } from "./api-server"
import {
  diseaseMapResponseSchema,
  normalizeDiseaseMap,
  type DiseaseMapPoint,
} from "./disease-intelligence"
import {
  normalizeTopDiseases,
  topDiseasesResponseSchema,
  type NormalizedTopDisease,
} from "./disease-ranking"

export interface DiseaseLandingData {
  diseases: NormalizedTopDisease[]
  mapPoints: DiseaseMapPoint[]
  diseasesFailed: boolean
  mapFailed: boolean
}

interface RevalidatedRequestInit extends RequestInit {
  next: {
    revalidate: number
  }
}

const REVALIDATED_GET: RevalidatedRequestInit = {
  next: { revalidate: 300 },
}

export async function getDiseaseLandingData(): Promise<DiseaseLandingData> {
  const [diseasesResult, mapResult] = await Promise.allSettled([
    apiFetch("/top-diseases/", REVALIDATED_GET),
    apiFetch("/disease-map/?limit=1000", REVALIDATED_GET),
  ])

  const diseasesParsed =
    diseasesResult.status === "fulfilled"
      ? topDiseasesResponseSchema.safeParse(diseasesResult.value)
      : null
  const mapParsed =
    mapResult.status === "fulfilled"
      ? diseaseMapResponseSchema.safeParse(mapResult.value)
      : null

  if (diseasesParsed !== null && !diseasesParsed.success) {
    console.error("[disease-data] unexpected top-diseases response")
  }
  if (mapParsed !== null && !mapParsed.success) {
    console.error("[disease-data] unexpected disease-map response")
  }

  return {
    diseases:
      diseasesParsed?.success === true
        ? normalizeTopDiseases(diseasesParsed.data)
        : [],
    mapPoints:
      mapParsed?.success === true ? normalizeDiseaseMap(mapParsed.data) : [],
    diseasesFailed: diseasesParsed?.success !== true,
    mapFailed: mapParsed?.success !== true,
  }
}
