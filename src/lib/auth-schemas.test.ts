import { describe, expect, test } from "bun:test"
import { loginResponseSchema } from "./auth-schemas"

describe("loginResponseSchema", () => {
  test("preserves the nested user returned by the backend", () => {
    const result = loginResponseSchema.parse({
      access_token: "token",
      token_type: "bearer",
      expires_at: "2026-08-02T12:00:00Z",
      user: {
        id: "6ef0196b-92fd-4c57-bf55-1665fcbec81c",
        full_name: "Test User",
        phone: null,
        email: "test@example.com",
        language: "ru",
        is_active: true,
        latitude: null,
        longitude: null,
        created_at: "2026-08-02T10:00:00Z",
        updated_at: "2026-08-02T10:00:00Z",
      },
    })

    expect(result.user.id).toBe("6ef0196b-92fd-4c57-bf55-1665fcbec81c")
    expect(result.user.language).toBe("ru")
  })
})
