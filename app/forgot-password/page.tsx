import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { AuthCard } from "@/src/components/auth/auth-card"
import { getDict } from "@/src/i18n/server"
import { ForgotPasswordForm } from "./forgot-password-form"

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict()
  return {
    title: dict.meta.forgotPassword.title,
    description: dict.meta.forgotPassword.description,
    robots: { index: false },
  }
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
