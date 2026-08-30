import { describe, expect, test } from "bun:test"
import { DURATION, REVEAL_OFFSET } from "./motion-tokens"

describe("Field Intelligence motion contract", () => {
  test("keeps feedback and transitions within the approved motion scale", () => {
    expect(DURATION).toEqual({ fast: 0.18, base: 0.28, slow: 0.42 })
  })

  test("limits reveal movement to a short spatial cue", () => {
    expect(REVEAL_OFFSET).toBe(16)
  })
})
