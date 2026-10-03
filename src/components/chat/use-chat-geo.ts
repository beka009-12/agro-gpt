"use client"

import { useEffect, useRef, useState } from "react"
import {
  clearCachedCoords,
  readCachedCoords,
  writeCachedCoords,
  type GeoCoords,
} from "./chat-geo-cache"

export type { GeoCoords } from "./chat-geo-cache"

/**
 * denied — пользователь запретил доступ (постоянно, до смены разрешения);
 * unavailable — таймаут / позиция недоступна (временно, повторяем при следующем запросе);
 * unsupported — в браузере нет Geolocation API.
 */
export type GeoStatus =
  | "idle"
  | "locating"
  | "granted"
  | "denied"
  | "unavailable"
  | "unsupported"

const GEO_TIMEOUT_MS = 8000
const GEO_MAX_AGE_MS = 5 * 60 * 1000

export interface ChatGeo {
  status: GeoStatus
  /** Есть координаты, которые уйдут с сообщением (свежие или из кеша). */
  hasCoords: boolean
  /** Не бросает. Если есть сохранённые координаты — отдаёт их сразу, свежие запрашивает в фоне. */
  getCoords: () => Promise<GeoCoords | null>
  /** Явный запрос по кнопке «включить»: снимает denied и пробует ещё раз. */
  enable: () => Promise<GeoStatus>
}

export function useChatGeo(): ChatGeo {
  const [status, setStatus] = useState<GeoStatus>("idle")
  // На сервере localStorage нет — readCachedCoords вернёт null; уведомление в idle
  // всё равно скрыто, так что расхождения при гидрации не будет
  const [initialCoords] = useState(readCachedCoords)
  const [hasCoords, setHasCoords] = useState(initialCoords !== null)
  const statusRef = useRef<GeoStatus>("idle")
  const coordsRef = useRef<GeoCoords | null>(initialCoords)
  const fetchedAtRef = useRef(0)
  const inFlightRef = useRef<Promise<GeoCoords | null> | null>(null)

  const applyStatus = (next: GeoStatus) => {
    statusRef.current = next
    setStatus(next)
  }

  const applyCoords = (coords: GeoCoords | null) => {
    coordsRef.current = coords
    setHasCoords(coords !== null)
  }

  const requestFresh = (): Promise<GeoCoords | null> => {
    if (inFlightRef.current) return inFlightRef.current
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      applyStatus("unsupported")
      return Promise.resolve(null)
    }

    applyStatus("locating")
    const request = new Promise<GeoCoords | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: GeoCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          fetchedAtRef.current = Date.now()
          writeCachedCoords(coords)
          applyCoords(coords)
          applyStatus("granted")
          resolve(coords)
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            // Доступ отозван — старые координаты больше не отправляем
            clearCachedCoords()
            applyCoords(null)
            applyStatus("denied")
            resolve(null)
            return
          }
          applyStatus("unavailable")
          resolve(coordsRef.current)
        },
        { timeout: GEO_TIMEOUT_MS, maximumAge: GEO_MAX_AGE_MS },
      )
    }).finally(() => {
      inFlightRef.current = null
    })
    inFlightRef.current = request
    return request
  }

  useEffect(() => {
    let alive = true
    let permission: PermissionStatus | null = null

    const applyPermission = (state: PermissionState) => {
      if (state === "denied") {
        clearCachedCoords()
        applyCoords(null)
        applyStatus("denied")
      } else if (state === "granted") {
        void requestFresh()
      } else if (statusRef.current === "denied") {
        applyStatus("idle")
      }
    }
    const onChange = () => {
      if (alive && permission) applyPermission(permission.state)
    }

    const check = async () => {
      try {
        permission = await navigator.permissions.query({ name: "geolocation" })
        if (!alive) return
        applyPermission(permission.state)
        permission.addEventListener("change", onChange)
      } catch {
        // Permissions API нет (старый Safari) — статус узнаем при первом запросе
      }
    }
    void check()

    return () => {
      alive = false
      permission?.removeEventListener("change", onChange)
    }
    // requestFresh опирается только на refs и стабильные сеттеры
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getCoords = async (): Promise<GeoCoords | null> => {
    if (statusRef.current === "denied" || statusRef.current === "unsupported") {
      return null
    }
    const known = coordsRef.current ?? readCachedCoords()
    if (known) {
      if (Date.now() - fetchedAtRef.current > GEO_MAX_AGE_MS) void requestFresh()
      return known
    }
    return requestFresh()
  }

  const enable = async (): Promise<GeoStatus> => {
    if (statusRef.current === "denied") applyStatus("idle")
    await requestFresh()
    return statusRef.current
  }

  return { status, hasCoords, getCoords, enable }
}
