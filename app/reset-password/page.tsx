import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { AuthCard } from "@/src/components/auth/auth-card"
import { getDict } from "@/src/i18n/server"
import { ResetPasswordForm } from "./reset-password-form"

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict()
  return {
    title: dict.meta.resetPassword.title,
    description: dict.meta.resetPassword.description,
    robots: { index: false },
  }
}

export default async function ResetPasswordPage() {
  const ru = await getDict()
  return (
    <AuthCard
      title={ru.auth.resetPassword.title}
      subtitle={ru.auth.resetPassword.subtitle}
      footer={
        <Link
          href="/login"
          className="font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
        >
          {ru.auth.resetPassword.backToLogin}
        </Link>
      }
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  )
}
