import { describe, expect, test } from "bun:test"
import {
  createChatHistoryState,
  reduceChatHistory,
  shouldRedirectAfterRemoval,
  shouldRollbackAfterFailure,
  shouldShowHistorySkeleton,
} from "./chat-history-state"
import type { ChatListItemSchema } from "@/src/api/generated/models"

function chat(id: string, title: string | null = "Помидоры"): ChatListItemSchema {
  return {
    id,
    title,
    created_at: "2026-09-01T00:00:00Z",
    last_message_at: "2026-09-20T00:00:00Z",
    messages_count: 1,
  }
}

describe("reduceChatHistory", () => {
  test("view-changed resets items and sets loading", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-succeeded", items: [chat("a")] })
    state = reduceChatHistory(state, { type: "view-changed", view: "trash" })

    expect(state.view).toBe("trash")
    expect(state.items).toEqual([])
    expect(state.status).toBe("loading")
  })

  test("load-succeeded stores items and sets ready", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-started" })
    state = reduceChatHistory(state, { type: "load-succeeded", items: [chat("a")] })

    expect(state.status).toBe("ready")
    expect(state.items).toEqual([chat("a")])
  })

  test("load-failed sets error status", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-started" })
    state = reduceChatHistory(state, { type: "load-failed" })

    expect(state.status).toBe("error")
  })

  test("rename-optimistic updates the matching item's title and clears renamingId", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-succeeded", items: [chat("a", "Old")] })
    state = reduceChatHistory(state, { type: "rename-started", id: "a" })
    state = reduceChatHistory(state, {
      type: "rename-optimistic",
      id: "a",
      title: "New",
    })

    expect(state.renamingId).toBeNull()
    expect(state.items[0].title).toBe("New")
  })

  test("rename-failed rolls back to the previous title", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-succeeded", items: [chat("a", "Old")] })
    state = reduceChatHistory(state, {
      type: "rename-optimistic",
      id: "a",
      title: "New",
    })
    state = reduceChatHistory(state, {
      type: "rename-failed",
      id: "a",
      previousTitle: "Old",
    })

    expect(state.items[0].title).toBe("Old")
  })

  test("delete-optimistic removes the item and clears pendingDeleteId", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-succeeded", items: [chat("a"), chat("b")] })
    state = reduceChatHistory(state, { type: "delete-requested", id: "b" })
    state = reduceChatHistory(state, { type: "delete-optimistic", id: "b" })

    expect(state.pendingDeleteId).toBeNull()
    expect(state.items.map((i) => i.id)).toEqual(["a"])
  })

  test("delete-failed re-inserts the item at its original index", () => {
    let state = createChatHistoryState()
    const items = [chat("a"), chat("b"), chat("c")]
    state = reduceChatHistory(state, { type: "load-succeeded", items })
    state = reduceChatHistory(state, { type: "delete-optimistic", id: "b" })
    state = reduceChatHistory(state, {
      type: "delete-failed",
      item: items[1],
      index: 1,
    })

    expect(state.items.map((i) => i.id)).toEqual(["a", "b", "c"])
  })

  test("restore-optimistic removes the item; restore-failed re-inserts it", () => {
    let state = createChatHistoryState()
    const items = [chat("a"), chat("b")]
    state = reduceChatHistory(state, { type: "load-succeeded", items })
    state = reduceChatHistory(state, { type: "restore-optimistic", id: "a" })
    expect(state.items.map((i) => i.id)).toEqual(["b"])

    state = reduceChatHistory(state, {
      type: "restore-failed",
      item: items[0],
      index: 0,
    })
    expect(state.items.map((i) => i.id)).toEqual(["a", "b"])
  })

  test("delete-cancelled and rename-cancelled clear their pending ids without touching items", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-succeeded", items: [chat("a")] })
    state = reduceChatHistory(state, { type: "delete-requested", id: "a" })
    state = reduceChatHistory(state, { type: "delete-cancelled" })
    expect(state.pendingDeleteId).toBeNull()
    expect(state.items).toHaveLength(1)

    state = reduceChatHistory(state, { type: "rename-started", id: "a" })
    state = reduceChatHistory(state, { type: "rename-cancelled" })
    expect(state.renamingId).toBeNull()
    expect(state.items[0].title).toBe("Помидоры")
  })
})

describe("shouldRedirectAfterRemoval", () => {
  test("is true when the removed chat is the active one", () => {
    expect(shouldRedirectAfterRemoval("a", "a")).toBe(true)
  })

  test("is false when the removed chat is not the active one", () => {
    expect(shouldRedirectAfterRemoval("a", "b")).toBe(false)
  })

  test("is false when there is no active chat", () => {
    expect(shouldRedirectAfterRemoval("a", null)).toBe(false)
  })
})

describe("shouldRollbackAfterFailure", () => {
  test("is false for a 404 (expired/gone) — no rollback, stays removed", () => {
    expect(shouldRollbackAfterFailure(404)).toBe(false)
  })

  test("is true for any other failure status", () => {
    expect(shouldRollbackAfterFailure(500)).toBe(true)
    expect(shouldRollbackAfterFailure(403)).toBe(true)
    expect(shouldRollbackAfterFailure(0)).toBe(true)
  })
})

describe("shouldShowHistorySkeleton", () => {
  test("shows the skeleton before and during the first load", () => {
    let state = createChatHistoryState()
    expect(shouldShowHistorySkeleton(state)).toBe(true)

    state = reduceChatHistory(state, { type: "load-started" })
    expect(shouldShowHistorySkeleton(state)).toBe(true)
  })

  test("keeps the current list during a background refresh", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-succeeded", items: [chat("a")] })
    state = reduceChatHistory(state, { type: "load-started" })

    expect(shouldShowHistorySkeleton(state)).toBe(false)
  })

  test("shows the skeleton again after switching to trash", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-succeeded", items: [chat("a")] })
    state = reduceChatHistory(state, { type: "view-changed", view: "trash" })

    expect(shouldShowHistorySkeleton(state)).toBe(true)
  })

  test("hides the skeleton once loaded, even when the list is empty or failed", () => {
    const empty = reduceChatHistory(createChatHistoryState(), {
      type: "load-succeeded",
      items: [],
    })
    const failed = reduceChatHistory(createChatHistoryState(), { type: "load-failed" })

    expect(shouldShowHistorySkeleton(empty)).toBe(false)
    expect(shouldShowHistorySkeleton(failed)).toBe(false)
  })
})
