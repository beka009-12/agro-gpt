"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import toast from "react-hot-toast"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Select } from "@/src/components/ui/select"
import { useI18n } from "@/src/i18n/client"
import {
  makeRegisterFormSchema,
  type RegisterFormValues,
} from "@/src/lib/auth-schemas"

const LANGUAGE_OPTIONS = [
  { value: "ky", label: "Кыргызча" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
] as const

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

export function RegisterForm() {
  const router = useRouter()
  const { dict: ru } = useI18n()
  const [serverError, setServerError] = useState<string | null>(null)
  const registerFormSchema = useMemo(() => makeRegisterFormSchema(ru), [ru])
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      password: "",
      confirm_password: "",
      language: "ky",
    },
  })

  const emailValue = useWatch({ control, name: "email" })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const { message, errors: fieldErrors } = await readErrorBody(
          res,
          ru.auth.errors.unavailable
        )
        if (res.status === 409) {
          toast(ru.auth.register.alreadyRegistered)
          router.push(`/login?identifier=${encodeURIComponent(values.phone)}`)
          return
        }
        let matched = false
        for (const [field, fieldMessage] of Object.entries(fieldErrors ?? {})) {
          if (field in values) {
            setError(field as keyof RegisterFormValues, { message: fieldMessage })
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
        id="full_name"
        label={ru.auth.register.nameLabel}
        placeholder={ru.auth.register.namePlaceholder}
        autoComplete="name"
        error={errors.full_name?.message}
        {...register("full_name")}
      />
      <Input
        id="phone"
        type="tel"
        label={ru.auth.register.phoneLabel}
        placeholder={ru.auth.register.phonePlaceholder}
        autoComplete="tel"
        error={errors.phone?.message}
        {...register("phone")}
      />
      <Input
        id="email"
        type="email"
        label={ru.auth.register.emailLabel}
        placeholder={ru.auth.register.emailPlaceholder}
        autoComplete="email"
        hint={ru.auth.register.emailHint}
        warning={
          emailValue.trim() === "" ? ru.auth.register.emailWarning : undefined
        }
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        id="password"
        type="password"
        label={ru.auth.register.passwordLabel}
        placeholder={ru.auth.register.passwordPlaceholder}
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        id="confirm_password"
        type="password"
        label={ru.auth.register.confirmPasswordLabel}
        autoComplete="new-password"
        error={errors.confirm_password?.message}
        {...register("confirm_password")}
      />
      <Select
        id="language"
        label={ru.auth.register.languageLabel}
        options={LANGUAGE_OPTIONS}
        error={errors.language?.message}
        {...register("language")}
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
        {ru.auth.register.submit}
      </Button>
    </form>
  )
}
