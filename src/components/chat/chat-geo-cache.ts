export interface GeoCoords {
  latitude: number
  longitude: number
}

interface StoredGeo extends GeoCoords {
  savedAt: number
}

export const GEO_CACHE_KEY = "ibo_last_coords"
export const GEO_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function isValidCoord(value: unknown, limit: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= limit
}

export function serializeCoords(coords: GeoCoords, now: number): string {
  const stored: StoredGeo = { ...coords, savedAt: now }
  return JSON.stringify(stored)
}

export function parseStoredCoords(
  raw: string | null,
  now: number,
  maxAgeMs: number = GEO_CACHE_MAX_AGE_MS,
): GeoCoords | null {
  if (!raw) return null
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (
    data === null ||
    typeof data !== "object" ||
    !("latitude" in data) ||
    !("longitude" in data) ||
    !("savedAt" in data)
  ) {
    return null
  }
  const { latitude, longitude, savedAt } = data
  if (!isValidCoord(latitude, 90) || !isValidCoord(longitude, 180)) return null
  if (typeof savedAt !== "number" || !Number.isFinite(savedAt)) return null
  const age = now - savedAt
  if (age < 0 || age > maxAgeMs) return null
  return { latitude, longitude }
}

export function readCachedCoords(now: number = Date.now()): GeoCoords | null {
  try {
    return parseStoredCoords(localStorage.getItem(GEO_CACHE_KEY), now)
  } catch {
    return null
  }
}

export function writeCachedCoords(coords: GeoCoords, now: number = Date.now()): void {
  try {
    localStorage.setItem(GEO_CACHE_KEY, serializeCoords(coords, now))
  } catch {
    // localStorage недоступен (privacy-режим) — живём только с координатами в памяти
  }
}

export function clearCachedCoords(): void {
  try {
    localStorage.removeItem(GEO_CACHE_KEY)
  } catch {
    // см. writeCachedCoords
  }
}
