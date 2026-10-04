"use client"

import { useEffect, useReducer } from "react"
import toast from "react-hot-toast"
import { useI18n } from "@/src/i18n/client"
import {
  createChatHistoryState,
  reduceChatHistory,
  shouldRedirectAfterRemoval,
  shouldRollbackAfterFailure,
  shouldShowHistorySkeleton,
} from "./chat-history-state"

export function useChatHistory(
  activeChatId: string | null,
  onActiveChatRemoved: () => void,
  refreshToken: number
) {
  const { dict } = useI18n()
  const [state, dispatch] = useReducer(reduceChatHistory, createChatHistoryState())

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      dispatch({ type: "load-started" })
      try {
        const res = await fetch(`/api/chat?deleted=${state.view === "trash"}`)
        if (!res.ok) throw new Error(String(res.status))
        const items = await res.json()
        if (!cancelled) dispatch({ type: "load-succeeded", items })
      } catch {
        if (!cancelled) dispatch({ type: "load-failed" })
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [state.view, refreshToken])

  const toggleView = () => {
    dispatch({ type: "view-changed", view: state.view === "chats" ? "trash" : "chats" })
  }

  const startRename = (id: string) => dispatch({ type: "rename-started", id })
  const cancelRename = () => dispatch({ type: "rename-cancelled" })

  const submitRename = async (id: string, title: string) => {
    const previousTitle = state.items.find((item) => item.id === id)?.title ?? null
    dispatch({ type: "rename-optimistic", id, title })
    try {
      const res = await fetch(`/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      if (!res.ok) throw new Error(String(res.status))
    } catch {
      dispatch({ type: "rename-failed", id, previousTitle })
      toast.error(dict.chat.history.errors.renameFailed)
    }
  }

  const requestDelete = (id: string) => dispatch({ type: "delete-requested", id })
  const cancelDelete = () => dispatch({ type: "delete-cancelled" })

  const confirmDelete = async (id: string) => {
    const index = state.items.findIndex((item) => item.id === id)
    const item = state.items[index]
    dispatch({ type: "delete-optimistic", id })
    if (shouldRedirectAfterRemoval(id, activeChatId)) onActiveChatRemoved()

    try {
      const res = await fetch(`/api/chat/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(String(res.status))
    } catch (error) {
      const status = error instanceof Error ? Number(error.message) : NaN
      if (item && shouldRollbackAfterFailure(status)) {
        dispatch({ type: "delete-failed", item, index })
        toast.error(dict.chat.history.errors.deleteFailed)
      }
    }
  }

  const restoreChat = async (id: string) => {
    const index = state.items.findIndex((item) => item.id === id)
    const item = state.items[index]
    dispatch({ type: "restore-optimistic", id })

    try {
      const res = await fetch(`/api/chat/${id}/restore`, { method: "POST" })
      if (res.ok) return
      if (res.status === 404) {
        toast.error(dict.chat.history.errors.restoreExpired)
        return
      }
      throw new Error(String(res.status))
    } catch (error) {
      const status = error instanceof Error ? Number(error.message) : NaN
      if (item && shouldRollbackAfterFailure(status)) {
        dispatch({ type: "restore-failed", item, index })
        toast.error(dict.chat.history.errors.restoreFailed)
      }
    }
  }

  return {
    view: state.view,
    items: state.items,
    status: state.status,
    showSkeleton: shouldShowHistorySkeleton(state),
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
