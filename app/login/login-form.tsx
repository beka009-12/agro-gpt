"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import toast from "react-hot-toast"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { useI18n } from "@/src/i18n/client"
import {
  makeLoginFormSchema,
  type LoginFormValues,
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

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { dict: ru } = useI18n()
  const initialIdentifier = searchParams.get("identifier") ?? ""
  const [serverError, setServerError] = useState<string | null>(null)

  const loginFormSchema = useMemo(() => makeLoginFormSchema(ru), [ru])
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { identifier: initialIdentifier, password: "" },
  })

  const identifier = useWatch({ control, name: "identifier" })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/login", {
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
            setError(field as keyof LoginFormValues, { message: fieldMessage })
            matched = true
          }
        }
        setServerError(matched ? null : message)
        return
      }
      router.push("/chat")
    } catch {
      toast.error(ru.auth.errors.network)
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <Input
        id="identifier"
        label={ru.auth.login.identifierLabel}
        placeholder={ru.auth.login.identifierPlaceholder}
        autoComplete="username"
        error={errors.identifier?.message}
        {...register("identifier")}
      />
      <Input
        id="password"
        type="password"
        label={ru.auth.login.passwordLabel}
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
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
        {ru.auth.login.submit}
      </Button>
      <Link
        href={`/forgot-password${identifier ? `?identifier=${encodeURIComponent(identifier)}` : ""}`}
        className="text-center text-sm font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
      >
        {ru.auth.login.forgotPassword}
      </Link>
    </form>
  )
}
