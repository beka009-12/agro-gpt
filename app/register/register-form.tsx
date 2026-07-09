"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Select } from "@/src/components/ui/select"
import ru from "@/src/i18n/ru.json"
import {
  registerFormSchema,
  type RegisterFormValues,
} from "@/src/lib/auth-schemas"

const LANGUAGE_OPTIONS = [
  { value: "ky", label: "Кыргызча" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
] as const

async function readErrorMessage(res: Response): Promise<string> {
  const data: unknown = await res.json().catch(() => null)
  if (
    data !== null &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message
  }
  return ru.auth.errors.unavailable
}

export function RegisterForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      region: "",
      language: "ky",
    },
  })

  const emailValue = watch("email")

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        setServerError(await readErrorMessage(res))
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
        id="region"
        label={ru.auth.register.regionLabel}
        placeholder={ru.auth.register.regionPlaceholder}
        error={errors.region?.message}
        {...register("region")}
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
