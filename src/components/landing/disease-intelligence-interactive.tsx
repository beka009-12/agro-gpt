"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowUpIcon,
  MapPinIcon,
  XIcon,
} from "@/src/components/ui/icons"
import type { Dictionary } from "@/src/i18n/dictionaries"
import {
  diseaseDetailsSchema,
  type DiseaseDetails,
  type DiseaseMapPoint,
} from "@/src/lib/disease-intelligence"
import type { NormalizedTopDisease } from "@/src/lib/disease-ranking"

const DiseaseMap = dynamic(() => import("./disease-map"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[360px] animate-pulse rounded-card border border-edge bg-surface-muted lg:min-h-[440px]" />
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
        <div className="rounded-card border border-edge bg-white p-5 sm:p-7">
          <div className="flex items-start justify-between gap-5 border-b border-edge pb-5">
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
            <ol className="mt-2">
              {visibleDiseases.map((disease, index) => {
                const selected = selectedDisease === disease.diseaseName
                const width = `${Math.max((disease.count / maximumCount) * 100, 8)}%`

                return (
                  <li key={disease.diseaseName} className="border-b border-edge last:border-b-0">
                    <button
                      type="button"
                      onClick={() => selectDisease(disease.diseaseName)}
                      className="group w-full py-4 text-left"
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
                      <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-accent-soft">
                        <span
                          className="block h-full rounded-full bg-accent transition-[width] duration-300"
                          style={{ width }}
                        />
                      </span>
                      <span className="mt-2 block pl-8 text-xs text-fg-faint">
                        {disease.isFallback
                          ? labels.ranking.fallback
                          : labels.ranking.observed}
                      </span>
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

        <div>
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
            <div className="flex min-h-[360px] items-center justify-center rounded-card border border-edge bg-surface-muted p-7 lg:min-h-[440px]">
              <StatusMessage
                title={labels.map.error}
                description={labels.map.errorDescription}
              />
            </div>
          ) : (
            <DiseaseMap
              points={mapPoints}
              labels={labels.map}
              onSelectDisease={selectDisease}
            />
          )}
        </div>
      </div>

      {selectedDisease !== null ? (
        <section
          className="mt-6 rounded-card border border-edge bg-white p-5 sm:p-7"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-5 border-b border-edge pb-5">
            <div>
              <p className="text-sm font-semibold text-accent">
                {labels.details.eyebrow}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.025em] text-fg sm:text-3xl">
                {selectedDisease}
              </h3>
              {selectedCount !== undefined ? (
                <p className="mt-2 text-sm text-fg-muted">
                  {labels.details.diagnoses.replace(
                    "{count}",
                    String(selectedCount)
                  )}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={closeDetails}
              className="flex size-10 shrink-0 items-center justify-center rounded-control border border-edge text-fg-muted transition-colors hover:border-accent hover:text-accent"
              aria-label={labels.details.close}
            >
              <XIcon size={18} />
            </button>
          </div>

          {detailsStatus === "loading" ? (
            <div className="grid gap-4 py-6 md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-control bg-surface-muted"
                />
              ))}
            </div>
          ) : null}

          {detailsStatus === "error" ? (
            <div className="py-7">
              <StatusMessage
                title={labels.details.error}
                description={labels.details.errorDescription}
              />
              <button
                type="button"
                onClick={retryDetails}
                className="mt-4 rounded-control bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong"
              >
                {labels.details.retry}
              </button>
            </div>
          ) : null}

          {detailsStatus === "ready" && details?.sources.length === 0 ? (
            <StatusMessage
              title={labels.details.empty}
              description={labels.details.emptyDescription}
            />
          ) : null}

          {detailsStatus === "ready" && details !== null ? (
            <div className="grid gap-4 pt-6 md:grid-cols-3">
              {details.sources.slice(0, 3).map((source, index) => (
                <article
                  key={`${source.title}-${index}`}
                  className="rounded-control border border-edge bg-surface-muted p-5"
                >
                  {source.cropName !== null ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent">
                      {source.cropName}
                    </p>
                  ) : null}
                  <h4 className="mt-2 font-display text-lg font-semibold leading-snug text-fg">
                    {source.title}
                  </h4>
                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-fg-muted">
                    {source.content}
                  </p>
                  {source.sourceUrl !== null ? (
                    <a
                      href={source.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex text-sm font-semibold text-accent hover:text-accent-strong"
                    >
                      {labels.details.source}
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
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
