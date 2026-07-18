"use client"

import { useEffect, useRef, useState } from "react"

export type GeoStatus = "idle" | "granted" | "denied" | "unavailable"

export interface GeoCoords {
  latitude: number
  longitude: number
}

const GEO_TIMEOUT_MS = 8000
const GEO_MAX_AGE_MS = 5 * 60 * 1000

/**
 * Геосостояние чата: тихо читает разрешение на маунте,
 * координаты запрашивает лениво через getCoords() при отправке сообщения.
 * getCoords никогда не бросает — при отказе/таймауте вернёт null.
 */
export function useChatGeo(): {
  status: GeoStatus
  getCoords: () => Promise<GeoCoords | null>
} {
  const [status, setStatus] = useState<GeoStatus>("idle")
  const statusRef = useRef<GeoStatus>("idle")
  const coordsRef = useRef<GeoCoords | null>(null)
  const inFlightRef = useRef<Promise<GeoCoords | null> | null>(null)

  const applyStatus = (next: GeoStatus) => {
    statusRef.current = next
    setStatus(next)
  }

  useEffect(() => {
    let alive = true
    const check = async () => {
      try {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        })
        if (!alive) return
        if (permission.state === "denied") applyStatus("denied")
        else if (permission.state === "granted") applyStatus("granted")
      } catch {
        // Permissions API нет (старый Safari) — остаёмся в idle,
        // статус узнаем при первом getCoords()
      }
    }
    void check()
    return () => {
      alive = false
    }
  }, [])

  const getCoords = (): Promise<GeoCoords | null> => {
    if (coordsRef.current) return Promise.resolve(coordsRef.current)
    if (statusRef.current === "denied" || statusRef.current === "unavailable") {
      return Promise.resolve(null)
    }
    if (inFlightRef.current) return inFlightRef.current
    if (!("geolocation" in navigator)) {
      applyStatus("unavailable")
      return Promise.resolve(null)
    }

    const request = new Promise<GeoCoords | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: GeoCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          coordsRef.current = coords
          applyStatus("granted")
          resolve(coords)
        },
        (error) => {
          applyStatus(
            error.code === error.PERMISSION_DENIED ? "denied" : "unavailable"
          )
          resolve(null)
        },
        { timeout: GEO_TIMEOUT_MS, maximumAge: GEO_MAX_AGE_MS }
      )
    }).finally(() => {
      inFlightRef.current = null
    })
    inFlightRef.current = request
    return request
  }

  return { status, getCoords }
}
