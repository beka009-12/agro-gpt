import type { Metadata } from "next"
import Link from "next/link"
import { AuthCard } from "@/src/components/auth/auth-card"
import ru from "@/src/i18n/ru.json"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "ibo — вход",
  description: "Войдите в ibo по коду из email.",
}

export default function LoginPage() {
  return (
    <AuthCard
      title={ru.auth.login.title}
      subtitle={ru.auth.login.subtitle}
      footer={
        <>
          {ru.auth.login.noAccount}{" "}
          <Link
            href="/register"
            className="font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            {ru.auth.login.registerLink}
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  )
}
