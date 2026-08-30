import { describe, expect, test } from "bun:test"
import { shouldSubmitChatInput } from "./chat-input-keyboard"

describe("chat input keyboard behavior", () => {
  test("submits a non-empty message when Enter is pressed", () => {
    expect(
      shouldSubmitChatInput({
        key: "Enter",
        shiftKey: false,
        composing: false,
        hasContent: true,
      }),
    ).toBe(true)
  })

  test("keeps a newline when Shift and Enter are pressed", () => {
    expect(
      shouldSubmitChatInput({
        key: "Enter",
        shiftKey: true,
        composing: false,
        hasContent: true,
      }),
    ).toBe(false)
  })

  test("does not submit while an IME composition is active", () => {
    expect(
      shouldSubmitChatInput({
        key: "Enter",
        shiftKey: false,
        composing: true,
        hasContent: true,
      }),
    ).toBe(false)
  })
})
