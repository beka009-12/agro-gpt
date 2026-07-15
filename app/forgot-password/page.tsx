import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { AuthCard } from "@/src/components/auth/auth-card"
import { getDict } from "@/src/i18n/server"
import { ForgotPasswordForm } from "./forgot-password-form"

export const metadata: Metadata = {
  title: "ibo — забыли пароль",
  description: "Восстановите доступ к аккаунту ibo.",
}

export default async function ForgotPasswordPage() {
  const ru = await getDict()
  return (
    <AuthCard
      title={ru.auth.forgotPassword.title}
      subtitle={ru.auth.forgotPassword.subtitle}
      footer={
        <Link
          href="/login"
          className="font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
        >
          {ru.auth.forgotPassword.backToLogin}
        </Link>
      }
    >
      <Suspense fallback={null}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthCard>
  )
}
