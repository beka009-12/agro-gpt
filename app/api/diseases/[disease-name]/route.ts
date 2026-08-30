import { NextResponse } from "next/server"
import { getDict } from "@/src/i18n/server"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import {
  diseaseDetailsResponseSchema,
  normalizeDiseaseDetails,
} from "@/src/lib/disease-intelligence"

interface DiseaseDetailsRouteContext {
  params: Promise<{
    "disease-name": string
  }>
}

export async function GET(
  _request: Request,
  context: DiseaseDetailsRouteContext
): Promise<NextResponse> {
  const dict = await getDict()
  const { "disease-name": rawDiseaseName } = await context.params
  const diseaseName = rawDiseaseName.normalize("NFKC").trim()

  if (diseaseName.length === 0 || diseaseName.length > 160) {
    return NextResponse.json(
      { message: dict.diseaseIntelligence.details.invalidName },
      { status: 400 }
    )
  }

  try {
    const response = await apiFetch(
      `/top-diseases/${encodeURIComponent(diseaseName)}/details`
    )
    const parsed = diseaseDetailsResponseSchema.safeParse(response)

    if (!parsed.success) {
      console.error("[disease-details] unexpected backend response")
      return NextResponse.json(
        { message: dict.diseaseIntelligence.details.error },
        { status: 502 }
      )
    }

    return NextResponse.json(normalizeDiseaseDetails(parsed.data))
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: dict.diseaseIntelligence.details.error },
        { status: error.status }
      )
    }

    console.error("[disease-details] unexpected error", error)
    return NextResponse.json(
      { message: dict.diseaseIntelligence.details.error },
      { status: 500 }
    )
  }
}
