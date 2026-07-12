"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/src/i18n/client"

export function LogoutButton() {
  const router = useRouter()
  const { dict: ru } = useI18n()
  const [loading, setLoading] = useState(false)

  const onLogout = async () => {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("[logout]", error)
    }
    router.push("/")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loading}
      className="flex items-center gap-1.5 text-[13px] font-semibold text-fg-faint transition-colors hover:text-fg disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && (
        <span
          aria-hidden
          className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {ru.chat.logout}
    </button>
  )
}
