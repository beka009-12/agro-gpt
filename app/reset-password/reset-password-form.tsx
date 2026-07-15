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
  makeResetPasswordFormSchema,
  type ResetPasswordFormValues,
} from "@/src/lib/auth-schemas"

interface ErrorBody {
  message: string
  errors?: Record<string, string>
}

async function readErrorBody(res: Response, fallback: string): Promise<ErrorBody> {
  const data: unknown = await res.json().catch(() => null)
  if (data !== null && typeof data === "object" && "message" in data) {
    const message =
      typeof data.message === "string" ? data.message : fallback
    const errors =
      "errors" in data && data.errors !== null && typeof data.errors === "object"
        ? (data.errors as Record<string, string>)
        : undefined
    return { message, errors }
  }
  return { message: fallback }
}

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { dict: ru } = useI18n()
  const initialIdentifier = searchParams.get("identifier") ?? ""
  const [serverError, setServerError] = useState<string | null>(null)

  const schema = useMemo(() => makeResetPasswordFormSchema(ru), [ru])
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      identifier: initialIdentifier,
      reset_code: "",
      new_password: "",
      confirm_password: "",
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const { message, errors: fieldErrors } = await readErrorBody(
          res,
          ru.auth.errors.unavailable
        )
        let matched = false
        for (const [field, fieldMessage] of Object.entries(fieldErrors ?? {})) {
          if (field in values) {
            setError(field as keyof ResetPasswordFormValues, {
              message: fieldMessage,
            })
            matched = true
          }
        }
        setServerError(matched ? null : message)
        return
      }
      toast.success(ru.auth.resetPassword.success)
      router.push("/login")
    } catch {
      toast.error(ru.auth.errors.network)
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <Input
        id="identifier"
        label={ru.auth.resetPassword.identifierLabel}
        placeholder={ru.auth.resetPassword.identifierPlaceholder}
        autoComplete="username"
        error={errors.identifier?.message}
        {...register("identifier")}
      />
      <Input
        id="reset_code"
        label={ru.auth.resetPassword.codeLabel}
        placeholder={ru.auth.resetPassword.codePlaceholder}
        inputMode="numeric"
        error={errors.reset_code?.message}
        {...register("reset_code")}
      />
      <Input
        id="new_password"
        type="password"
        label={ru.auth.resetPassword.newPasswordLabel}
        autoComplete="new-password"
        error={errors.new_password?.message}
        {...register("new_password")}
      />
      <Input
        id="confirm_password"
        type="password"
        label={ru.auth.resetPassword.confirmPasswordLabel}
        autoComplete="new-password"
        error={errors.confirm_password?.message}
        {...register("confirm_password")}
      />
      {serverError && (
        <p
          className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
          role="alert"
        >
          {serverError}
        </p>
      )}
      <Button type="submit" loading={isSubmitting} className="mt-1">
        {ru.auth.resetPassword.submit}
      </Button>
    </form>
  )
}
