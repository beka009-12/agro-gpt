"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowUpIcon,
  MapPinIcon,
} from "@/src/components/ui/icons"
import type { Dictionary } from "@/src/i18n/dictionaries"
import {
  diseaseDetailsSchema,
  type DiseaseDetails,
  type DiseaseMapPoint,
} from "@/src/lib/disease-intelligence"
import type { NormalizedTopDisease } from "@/src/lib/disease-ranking"
import { DiseaseDetailsModal } from "./disease-details-modal"

const DiseaseMap = dynamic(() => import("./disease-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[360px] animate-pulse rounded-card border border-edge bg-surface-muted" />
  ),
})

interface DiseaseIntelligenceInteractiveProps {
  diseases: NormalizedTopDisease[]
  mapPoints: DiseaseMapPoint[]
  diseasesFailed: boolean
  mapFailed: boolean
  labels: Dictionary["diseaseIntelligence"]
}

type DetailsStatus = "idle" | "loading" | "ready" | "error"

export function DiseaseIntelligenceInteractive({
  diseases,
  mapPoints,
  diseasesFailed,
  mapFailed,
  labels,
}: DiseaseIntelligenceInteractiveProps) {
  const visibleDiseases = diseases.slice(0, 5)
  const maximumCount = Math.max(...visibleDiseases.map((item) => item.count), 1)
  const detailsCache = useRef(new Map<string, DiseaseDetails>())
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null)
  const [details, setDetails] = useState<DiseaseDetails | null>(null)
  const [detailsStatus, setDetailsStatus] = useState<DetailsStatus>("idle")
  const [retryKey, setRetryKey] = useState(0)

  const selectedCount = useMemo(
    () => diseases.find((item) => item.diseaseName === selectedDisease)?.count,
    [diseases, selectedDisease]
  )

  function selectDisease(diseaseName: string) {
    const cachedDetails = detailsCache.current.get(diseaseName)
    setSelectedDisease(diseaseName)
    setDetails(cachedDetails ?? null)
    setDetailsStatus(cachedDetails === undefined ? "loading" : "ready")
  }

  function closeDetails() {
    setSelectedDisease(null)
    setDetails(null)
    setDetailsStatus("idle")
  }

  function retryDetails() {
    setDetails(null)
    setDetailsStatus("loading")
    setRetryKey((current) => current + 1)
  }

  useEffect(() => {
    if (selectedDisease === null || detailsStatus !== "loading") return

    const controller = new AbortController()

    async function loadDetails() {
      try {
        const response = await fetch(
          `/api/diseases/${encodeURIComponent(selectedDisease ?? "")}`,
          { signal: controller.signal }
        )
        const body: unknown = await response.json()

        if (!response.ok) throw new Error("Disease details request failed")

        const parsed = diseaseDetailsSchema.safeParse(body)
        if (!parsed.success) throw new Error("Invalid disease details response")

        detailsCache.current.set(selectedDisease ?? "", parsed.data)
        setDetails(parsed.data)
        setDetailsStatus("ready")
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setDetailsStatus("error")
      }
    }

    void loadDetails()
    return () => controller.abort()
  }, [detailsStatus, retryKey, selectedDisease])

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-card border border-edge bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-5 border-b border-edge pb-4">
            <div>
              <p className="text-sm font-semibold text-accent">
                {labels.ranking.eyebrow}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.025em] text-fg">
                {labels.ranking.title}
              </h3>
            </div>
            <ArrowUpIcon className="mt-1 shrink-0 text-accent" size={23} />
          </div>

          {visibleDiseases.length > 0 ? (
            <ol className="mt-1">
              {visibleDiseases.map((disease, index) => {
                const selected = selectedDisease === disease.diseaseName
                const width = `${Math.max((disease.count / maximumCount) * 100, 8)}%`

                return (
                  <li key={disease.diseaseName} className="border-b border-edge last:border-b-0">
                    <button
                      type="button"
                      onClick={() => selectDisease(disease.diseaseName)}
                      className="group w-full py-3 text-left"
                      aria-haspopup="dialog"
                      aria-expanded={selected}
                    >
                      <span className="flex items-center gap-3">
                        <span className="font-mono text-xs text-fg-faint">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1 font-display text-[17px] font-semibold text-fg transition-colors group-hover:text-accent">
                          {disease.diseaseName}
                        </span>
                        <span className="font-mono text-sm font-semibold text-fg">
                          {disease.count}
                        </span>
                      </span>
                      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-accent-soft">
                        <span
                          className="block h-full rounded-full bg-accent transition-[width] duration-300"
                          style={{ width }}
                        />
                      </span>
                      {disease.isFallback ? (
                        <span className="mt-1.5 block pl-8 text-xs text-fg-faint">
                          {labels.ranking.fallback}
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ol>
          ) : (
            <StatusMessage
              title={
                diseasesFailed ? labels.ranking.error : labels.ranking.empty
              }
              description={
                diseasesFailed
                  ? labels.ranking.errorDescription
                  : labels.ranking.emptyDescription
              }
            />
          )}
        </div>

        <div className="flex flex-col">
          <div className="mb-4 flex items-end justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-accent">
                {labels.map.eyebrow}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.025em] text-fg">
                {labels.map.title}
              </h3>
            </div>
            <span className="hidden items-center gap-2 text-sm text-fg-muted sm:flex">
              <MapPinIcon size={17} className="text-accent" />
              {labels.map.points.replace("{count}", String(mapPoints.length))}
            </span>
          </div>
          {mapFailed ? (
            <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-card border border-edge bg-surface-muted p-7">
              <StatusMessage
                title={labels.map.error}
                description={labels.map.errorDescription}
              />
            </div>
          ) : (
            // карта тянется до высоты рейтинга — без пустоты под ней
            <div className="flex-1">
              <DiseaseMap
                points={mapPoints}
                labels={labels.map}
                onSelectDisease={selectDisease}
              />
            </div>
          )}
        </div>
      </div>

      <DiseaseDetailsModal
        diseaseName={selectedDisease}
        diagnosesCount={selectedCount}
        details={details}
        status={detailsStatus}
        labels={labels.details}
        onClose={closeDetails}
        onRetry={retryDetails}
      />
    </>
  )
}

interface StatusMessageProps {
  title: string
  description: string
}

function StatusMessage({ title, description }: StatusMessageProps) {
  return (
    <div className="py-8 text-center">
      <p className="font-display text-lg font-semibold text-fg">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-fg-muted">
        {description}
      </p>
    </div>
  )
}
