import type { Metadata } from "next"
import Link from "next/link"
import { AuthCard } from "@/src/components/auth/auth-card"
import { getDict } from "@/src/i18n/server"
import { RegisterForm } from "./register-form"

export const metadata: Metadata = {
  title: "ibo — регистрация",
  description: "Создайте аккаунт ibo — AI-агроном в вашем кармане.",
}

export default async function RegisterPage() {
  const ru = await getDict()
  return (
    <AuthCard
      title={ru.auth.register.title}
      subtitle={ru.auth.register.subtitle}
      footer={
        <>
          {ru.auth.register.haveAccount}{" "}
          <Link
            href="/login"
            className="font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            {ru.auth.register.loginLink}
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  )
}
