"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import ru from "@/src/i18n/ru.json"

export function LogoutButton() {
  const router = useRouter()
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
    <Button type="button" loading={loading} onClick={onLogout}>
      {ru.auth.chat.logout}
    </Button>
  )
}
