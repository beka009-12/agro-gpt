import { describe, expect, test } from "bun:test"
import { GEO_CACHE_MAX_AGE_MS, parseStoredCoords, serializeCoords } from "./chat-geo-cache"

const NOW = 1_700_000_000_000
const COORDS = { latitude: 42.87, longitude: 74.59 }

describe("chat geo cache", () => {
  test("round-trips fresh coordinates", () => {
    expect(parseStoredCoords(serializeCoords(COORDS, NOW), NOW + 1000)).toEqual(COORDS)
  })

  test("accepts coordinates right at the max age", () => {
    const raw = serializeCoords(COORDS, NOW)
    expect(parseStoredCoords(raw, NOW + GEO_CACHE_MAX_AGE_MS)).toEqual(COORDS)
  })

  test("rejects coordinates older than the max age", () => {
    const raw = serializeCoords(COORDS, NOW)
    expect(parseStoredCoords(raw, NOW + GEO_CACHE_MAX_AGE_MS + 1)).toBeNull()
  })

  test("rejects timestamps from the future", () => {
    expect(parseStoredCoords(serializeCoords(COORDS, NOW + 60_000), NOW)).toBeNull()
  })

  test("rejects empty, malformed and out-of-range values", () => {
    expect(parseStoredCoords(null, NOW)).toBeNull()
    expect(parseStoredCoords("not json", NOW)).toBeNull()
    expect(parseStoredCoords(JSON.stringify({ latitude: 1, longitude: 2 }), NOW)).toBeNull()
    expect(
      parseStoredCoords(JSON.stringify({ latitude: 91, longitude: 2, savedAt: NOW }), NOW),
    ).toBeNull()
    expect(
      parseStoredCoords(JSON.stringify({ latitude: "1", longitude: 2, savedAt: NOW }), NOW),
    ).toBeNull()
  })
})
