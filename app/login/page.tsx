import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { AuthCard } from "@/src/components/auth/auth-card"
import { getDict } from "@/src/i18n/server"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "ibo — вход",
  description: "Войдите в ibo по номеру телефона или email и паролю.",
}

export default async function LoginPage() {
  const ru = await getDict()
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
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  )
}
