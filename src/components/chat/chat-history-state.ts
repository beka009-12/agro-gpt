import type { ChatListItemSchema } from "@/src/api/generated/models"

export type ChatHistoryView = "chats" | "trash"
export type ChatHistoryStatus = "idle" | "loading" | "ready" | "error"

export interface ChatHistoryState {
  view: ChatHistoryView
  items: ChatListItemSchema[]
  status: ChatHistoryStatus
  renamingId: string | null
  pendingDeleteId: string | null
}

export type ChatHistoryAction =
  | { type: "view-changed"; view: ChatHistoryView }
  | { type: "load-started" }
  | { type: "load-succeeded"; items: ChatListItemSchema[] }
  | { type: "load-failed" }
  | { type: "rename-started"; id: string }
  | { type: "rename-cancelled" }
  | { type: "rename-optimistic"; id: string; title: string }
  | { type: "rename-failed"; id: string; previousTitle: string | null }
  | { type: "delete-requested"; id: string }
  | { type: "delete-cancelled" }
  | { type: "delete-optimistic"; id: string }
  | { type: "delete-failed"; item: ChatListItemSchema; index: number }
  | { type: "restore-optimistic"; id: string }
  | { type: "restore-failed"; item: ChatListItemSchema; index: number }

export function createChatHistoryState(): ChatHistoryState {
  return {
    view: "chats",
    items: [],
    status: "idle",
    renamingId: null,
    pendingDeleteId: null,
  }
}

function reinsert(
  items: ChatListItemSchema[],
  item: ChatListItemSchema,
  index: number
): ChatListItemSchema[] {
  const next = items.slice()
  next.splice(Math.min(index, next.length), 0, item)
  return next
}

export function reduceChatHistory(
  state: ChatHistoryState,
  action: ChatHistoryAction
): ChatHistoryState {
  switch (action.type) {
    case "view-changed":
      return {
        ...state,
        view: action.view,
        items: [],
        status: "loading",
        renamingId: null,
        pendingDeleteId: null,
      }
    case "load-started":
      return { ...state, status: "loading" }
    case "load-succeeded":
      return { ...state, status: "ready", items: action.items }
    case "load-failed":
      return { ...state, status: "error" }
    case "rename-started":
      return { ...state, renamingId: action.id }
    case "rename-cancelled":
      return { ...state, renamingId: null }
    case "rename-optimistic":
      return {
        ...state,
        renamingId: null,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, title: action.title } : item
        ),
      }
    case "rename-failed":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, title: action.previousTitle } : item
        ),
      }
    case "delete-requested":
      return { ...state, pendingDeleteId: action.id }
    case "delete-cancelled":
      return { ...state, pendingDeleteId: null }
    case "delete-optimistic":
      return {
        ...state,
        pendingDeleteId: null,
        items: state.items.filter((item) => item.id !== action.id),
      }
    case "delete-failed":
      return { ...state, items: reinsert(state.items, action.item, action.index) }
    case "restore-optimistic":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      }
    case "restore-failed":
      return { ...state, items: reinsert(state.items, action.item, action.index) }
  }
}

export function shouldRedirectAfterRemoval(
  removedId: string,
  activeChatId: string | null
): boolean {
  return removedId === activeChatId
}

export function shouldRollbackAfterFailure(status: number): boolean {
  return status !== 404
}

// скелетон — только когда показать нечего; при фоновом обновлении список остаётся на месте
export function shouldShowHistorySkeleton(state: ChatHistoryState): boolean {
  return (
    state.items.length === 0 &&
    (state.status === "idle" || state.status === "loading")
  )
}

export function canSubmitRename(draft: string, currentTitle: string | null): boolean {
  const title = draft.trim()
  return title.length > 0 && title !== currentTitle
}
