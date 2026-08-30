import { describe, expect, test } from "bun:test"
import {
  createSidebarState,
  getSidebarPresentation,
  reduceSidebarState,
} from "./sidebar-state"

describe("chat sidebar state", () => {
  test("preserves the desktop preference across viewport changes", () => {
    let state = createSidebarState()

    state = reduceSidebarState(state, {
      type: "viewport-changed",
      isDesktop: true,
    })
    state = reduceSidebarState(state, { type: "toggle" })
    state = reduceSidebarState(state, {
      type: "viewport-changed",
      isDesktop: false,
    })
    state = reduceSidebarState(state, { type: "open" })
    state = reduceSidebarState(state, {
      type: "viewport-changed",
      isDesktop: true,
    })

    expect(getSidebarPresentation(state)).toEqual({
      desktopExpanded: true,
      mobileOpen: false,
      visible: true,
    })
  })

  test("closes only the mobile drawer after starting a new chat", () => {
    let state = createSidebarState()

    state = reduceSidebarState(state, { type: "open" })
    state = reduceSidebarState(state, { type: "new-chat" })

    expect(getSidebarPresentation(state).mobileOpen).toBe(false)

    state = reduceSidebarState(state, {
      type: "viewport-changed",
      isDesktop: true,
    })
    state = reduceSidebarState(state, { type: "open" })
    state = reduceSidebarState(state, { type: "new-chat" })

    expect(getSidebarPresentation(state).desktopExpanded).toBe(true)
  })
})
