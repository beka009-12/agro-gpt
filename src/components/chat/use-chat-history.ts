"use client"

import { useEffect, useReducer } from "react"
import toast from "react-hot-toast"
import { useI18n } from "@/src/i18n/client"
import {
  createChatHistoryState,
  reduceChatHistory,
  shouldRedirectAfterRemoval,
  shouldRollbackAfterFailure,
} from "./chat-history-state"

export function useChatHistory(
  activeChatId: string | null,
  onActiveChatRemoved: () => void
) {
  const { dict } = useI18n()
  const [state, dispatch] = useReducer(reduceChatHistory, createChatHistoryState())

  useEffect(() => {
    let cancelled = false
    dispatch({ type: "load-started" })

    fetch(`/api/chat?deleted=${state.view === "trash"}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json()
      })
      .then((items) => {
        if (!cancelled) dispatch({ type: "load-succeeded", items })
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "load-failed" })
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.view])

  const toggleView = () => {
    dispatch({ type: "view-changed", view: state.view === "chats" ? "trash" : "chats" })
  }

  const startRename = (id: string) => dispatch({ type: "rename-started", id })
  const cancelRename = () => dispatch({ type: "rename-cancelled" })

  const submitRename = (id: string, title: string) => {
    const previousTitle = state.items.find((item) => item.id === id)?.title ?? null
    dispatch({ type: "rename-optimistic", id, title })
    void fetch(`/api/chat/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then((res) => {
      if (!res.ok) {
        dispatch({ type: "rename-failed", id, previousTitle })
        toast.error(dict.chat.history.errors.renameFailed)
      }
    })
  }

  const requestDelete = (id: string) => dispatch({ type: "delete-requested", id })
  const cancelDelete = () => dispatch({ type: "delete-cancelled" })

  const confirmDelete = (id: string) => {
    const index = state.items.findIndex((item) => item.id === id)
    const item = state.items[index]
    dispatch({ type: "delete-optimistic", id })
    if (shouldRedirectAfterRemoval(id, activeChatId)) onActiveChatRemoved()

    void fetch(`/api/chat/${id}`, { method: "DELETE" }).then((res) => {
      if (!res.ok && item && shouldRollbackAfterFailure(res.status)) {
        dispatch({ type: "delete-failed", item, index })
        toast.error(dict.chat.history.errors.deleteFailed)
      }
    })
  }

  const restoreChat = (id: string) => {
    const index = state.items.findIndex((item) => item.id === id)
    const item = state.items[index]
    dispatch({ type: "restore-optimistic", id })

    void fetch(`/api/chat/${id}/restore`, { method: "POST" }).then((res) => {
      if (res.ok) return
      if (res.status === 404) {
        toast.error(dict.chat.history.errors.restoreExpired)
        return
      }
      if (item && shouldRollbackAfterFailure(res.status)) {
        dispatch({ type: "restore-failed", item, index })
        toast.error(dict.chat.history.errors.restoreFailed)
      }
    })
  }

  return {
    view: state.view,
    items: state.items,
    status: state.status,
    renamingId: state.renamingId,
    pendingDeleteId: state.pendingDeleteId,
    toggleView,
    startRename,
    cancelRename,
    submitRename,
    requestDelete,
    cancelDelete,
    confirmDelete,
    restoreChat,
  }
}
