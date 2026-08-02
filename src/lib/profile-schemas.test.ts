import { describe, expect, test } from "bun:test"
import { userProfileSchema } from "./profile-schemas"

describe("userProfileSchema", () => {
  test("preserves the profile fields returned by the backend", () => {
    const profile = userProfileSchema.parse({
      id: "6ef0196b-92fd-4c57-bf55-1665fcbec81c",
      full_name: "Test User",
      phone: null,
      email: "test@example.com",
      language: "ru",
      is_active: true,
      latitude: 42.87,
      longitude: 74.59,
      created_at: "2026-08-02T10:00:00Z",
      updated_at: "2026-08-02T10:00:00Z",
    })

    expect(profile.phone).toBeNull()
    expect(profile.is_active).toBeTrue()
    expect(profile.created_at).toBe("2026-08-02T10:00:00Z")
    expect("location_available" in profile).toBeFalse()
  })
})
