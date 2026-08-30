"use client"

import { useEffect, useRef } from "react"
import type { Map as LeafletMap } from "leaflet"
import type { DiseaseMapPoint } from "@/src/lib/disease-intelligence"

interface DiseaseMapLabels {
  ariaLabel: string
  emptyTitle: string
  emptyDescription: string
}

interface DiseaseMapProps {
  points: DiseaseMapPoint[]
  labels: DiseaseMapLabels
  onSelectDisease: (diseaseName: string) => void
}

const KYRGYZSTAN_CENTER: [number, number] = [41.25, 74.6]

export default function DiseaseMap({
  points,
  labels,
  onSelectDisease,
}: DiseaseMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const onSelectRef = useRef(onSelectDisease)

  useEffect(() => {
    onSelectRef.current = onSelectDisease
  }, [onSelectDisease])

  useEffect(() => {
    const container = containerRef.current
    if (container === null) return

    let cancelled = false

    async function initializeMap() {
      const L = await import("leaflet")
      await import("leaflet.markercluster")

      if (cancelled || containerRef.current === null) return

      const map = L.map(containerRef.current, {
        attributionControl: true,
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView(KYRGYZSTAN_CENTER, 6)
      mapRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      if (points.length === 0) return

      const cluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 46,
        iconCreateFunction(group) {
          return L.divIcon({
            className: "ibo-map-cluster",
            html: `<span>${group.getChildCount()}</span>`,
            iconSize: [42, 42],
          })
        },
      })

      const bounds: [number, number][] = []
      points.forEach((point) => {
        const position: [number, number] = [point.latitude, point.longitude]
        const marker = L.marker(position, {
          title: point.diseaseName,
          icon: L.divIcon({
            className: "ibo-map-marker",
            html: "<span></span>",
            iconAnchor: [11, 11],
            iconSize: [22, 22],
          }),
        })
        marker.on("click", () => onSelectRef.current(point.diseaseName))
        cluster.addLayer(marker)
        bounds.push(position)
      })

      map.addLayer(cluster)
      map.fitBounds(bounds, { padding: [44, 44], maxZoom: 10 })
    }

    void initializeMap()

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [points])

  return (
    <div className="relative isolate min-h-[360px] overflow-hidden rounded-card border border-edge bg-surface-muted lg:min-h-[440px]">
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        aria-label={labels.ariaLabel}
      />
      {points.length === 0 ? (
        <div className="pointer-events-none absolute inset-x-5 bottom-5 z-[400] rounded-control border border-edge bg-white/95 p-4 shadow-sm backdrop-blur-sm sm:inset-x-auto sm:left-5 sm:max-w-[330px]">
          <p className="font-display text-base font-semibold text-fg">
            {labels.emptyTitle}
          </p>
          <p className="mt-1 text-sm leading-6 text-fg-muted">
            {labels.emptyDescription}
          </p>
        </div>
      ) : null}
    </div>
  )
}
