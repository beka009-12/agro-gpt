import { describe, expect, test } from "bun:test"
import {
  getDialogFocusTarget,
  shouldCloseDiseaseDialog,
} from "./disease-details-dialog"

describe("disease details dialog keyboard behavior", () => {
  test("closes only when Escape is pressed", () => {
    expect(shouldCloseDiseaseDialog("Escape")).toBeTrue()
    expect(shouldCloseDiseaseDialog("Enter")).toBeFalse()
    expect(shouldCloseDiseaseDialog("Tab")).toBeFalse()
  })

  test("wraps focus from the last control to the first on Tab", () => {
    expect(
      getDialogFocusTarget({
        activeIndex: 3,
        focusableCount: 4,
        shiftKey: false,
      })
    ).toBe(0)
  })

  test("wraps focus from the first control to the last on Shift+Tab", () => {
    expect(
      getDialogFocusTarget({
        activeIndex: 0,
        focusableCount: 4,
        shiftKey: true,
      })
    ).toBe(3)
  })

  test("keeps native focus movement away from dialog boundaries", () => {
    expect(
      getDialogFocusTarget({
        activeIndex: 1,
        focusableCount: 4,
        shiftKey: false,
      })
    ).toBeNull()
  })
})
