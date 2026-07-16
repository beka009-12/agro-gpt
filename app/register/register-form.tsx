"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { PasswordInput } from "@/src/components/ui/password-input"
import { Select } from "@/src/components/ui/select"
import { StepIndicator } from "@/src/components/auth/step-indicator"
import { StepTransition } from "@/src/components/auth/step-transition"
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

const STEP_FIELDS: (keyof RegisterFormValues)[][] = [
  ["full_name", "email"],
  ["password", "confirm_password"],
  ["language"],
]

const LAST_STEP = STEP_FIELDS.length - 1

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
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const registerFormSchema = useMemo(() => makeRegisterFormSchema(ru), [ru])
  const {
    register,
    handleSubmit,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
      language: "ky",
    },
  })

  const goToStep = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const submitRegistration = async (values: RegisterFormValues) => {
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
          router.push(`/login?email=${encodeURIComponent(values.email)}`)
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
  }

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (step < LAST_STEP) {
      const ok = await trigger(STEP_FIELDS[step])
      if (ok) goToStep(step + 1)
      return
    }
    await handleSubmit(submitRegistration)()
  }

  return (
    <form onSubmit={onFormSubmit} noValidate className="flex flex-col gap-4">
      <StepIndicator steps={ru.auth.register.steps} current={step} />
      <StepTransition stepKey={step} direction={direction}>
        <div className="flex flex-col gap-4">
          {step === 0 && (
            <>
              <Input
                id="full_name"
                label={ru.auth.register.nameLabel}
                placeholder={ru.auth.register.namePlaceholder}
                autoComplete="name"
                autoFocus
                error={errors.full_name?.message}
                {...register("full_name")}
              />
              <Input
                id="email"
                type="email"
                label={ru.auth.register.emailLabel}
                placeholder={ru.auth.register.emailPlaceholder}
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
            </>
          )}
          {step === 1 && (
            <>
              <PasswordInput
                id="password"
                label={ru.auth.register.passwordLabel}
                placeholder={ru.auth.register.passwordPlaceholder}
                autoComplete="new-password"
                autoFocus
                showLabel={ru.auth.common.showPassword}
                hideLabel={ru.auth.common.hidePassword}
                error={errors.password?.message}
                {...register("password")}
              />
              <PasswordInput
                id="confirm_password"
                label={ru.auth.register.confirmPasswordLabel}
                autoComplete="new-password"
                showLabel={ru.auth.common.showPassword}
                hideLabel={ru.auth.common.hidePassword}
                error={errors.confirm_password?.message}
                {...register("confirm_password")}
              />
            </>
          )}
          {step === 2 && (
            <Select
              id="language"
              label={ru.auth.register.languageLabel}
              options={LANGUAGE_OPTIONS}
              autoFocus
              error={errors.language?.message}
              {...register("language")}
            />
          )}
        </div>
      </StepTransition>
      {serverError && (
        <p
          className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
          role="alert"
        >
          {serverError}
        </p>
      )}
      <div className="mt-1 flex items-center gap-3">
        {step > 0 && (
          <Button type="button" variant="ghost" onClick={() => goToStep(step - 1)}>
            {ru.auth.common.back}
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {step < LAST_STEP ? ru.auth.common.next : ru.auth.register.submit}
        </Button>
      </div>
    </form>
  )
}
