"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { useI18n } from "@/src/i18n/client"
import {
  makeForgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from "@/src/lib/auth-schemas"

export function ForgotPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { dict: ru } = useI18n()
  const initialIdentifier = searchParams.get("identifier") ?? ""
  const [sent, setSent] = useState(false)

  const schema = useMemo(() => makeForgotPasswordFormSchema(ru), [ru])
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: initialIdentifier },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      // ответ намеренно одинаковый вне зависимости от результата —
      // бэк не палит существование аккаунта
      setSent(true)
    } catch {
      toast.error(ru.auth.errors.network)
    }
  })

  if (sent) {
    const identifier = getValues("identifier")
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-fg-muted">{ru.auth.forgotPassword.sent}</p>
        <Button
          type="button"
          onClick={() =>
            router.push(
              `/reset-password?identifier=${encodeURIComponent(identifier)}`
            )
          }
        >
          {ru.auth.resetPassword.title}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <Input
        id="identifier"
        label={ru.auth.forgotPassword.identifierLabel}
        placeholder={ru.auth.forgotPassword.identifierPlaceholder}
        autoComplete="username"
        error={errors.identifier?.message}
        {...register("identifier")}
      />
      <Button type="submit" loading={isSubmitting} className="mt-1">
        {ru.auth.forgotPassword.submit}
      </Button>
    </form>
  )
}
