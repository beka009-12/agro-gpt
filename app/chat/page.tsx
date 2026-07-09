import type { Metadata } from "next"
import { cookies } from "next/headers"
import ru from "@/src/i18n/ru.json"
import { parseAuthUser, USER_COOKIE } from "@/src/lib/auth-cookies"
import { LogoutButton } from "./logout-button"

export const metadata: Metadata = {
  title: "ibo — чат",
}

export default async function ChatPage() {
  const store = await cookies()
  const user = parseAuthUser(store.get(USER_COOKIE)?.value)
  const greeting = user?.full_name
    ? ru.auth.chat.greetingNamed.replace("{name}", user.full_name)
    : ru.auth.chat.greeting

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted">
        <span aria-hidden className="h-px w-6 bg-edge" />
        {ru.auth.chat.badge}
        <span aria-hidden className="h-px w-6 bg-edge" />
      </p>
      <h1 className="font-display text-4xl font-semibold text-fg sm:text-5xl">
        {greeting}
      </h1>
      <p className="max-w-md leading-relaxed text-fg-muted">{ru.auth.chat.wip}</p>
      <LogoutButton />
    </main>
  )
}
