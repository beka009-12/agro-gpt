"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import toast from "react-hot-toast"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { PasswordInput } from "@/src/components/ui/password-input"
import { StepIndicator } from "@/src/components/auth/step-indicator"
import { StepTransition } from "@/src/components/auth/step-transition"
import { useI18n } from "@/src/i18n/client"
import {
  makeLoginFormSchema,
  type LoginFormValues,
} from "@/src/lib/auth-schemas"

const STEP_FIELDS: (keyof LoginFormValues)[][] = [["email"], ["password"]]

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

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { dict: ru } = useI18n()
  const initialEmail = searchParams.get("email") ?? ""
  const [serverError, setServerError] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)

  const loginFormSchema = useMemo(() => makeLoginFormSchema(ru), [ru])
  const {
    register,
    handleSubmit,
    control,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: initialEmail, password: "" },
  })

  const email = useWatch({ control, name: "email" })

  const goToStep = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const submitLogin = async (values: LoginFormValues) => {
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
  }

  // react-hook-form's handleSubmit() always validates the FULL zod schema
  // (both steps' fields) before invoking its callback — so on step 0 it
  // would block on step 1's still-empty password field and never call our
  // step-branching logic. Branch BEFORE touching handleSubmit; only the
  // true final step needs (and gets) full-schema validation.
  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (step < LAST_STEP) {
      const ok = await trigger(STEP_FIELDS[step])
      if (ok) goToStep(step + 1)
      return
    }
    await handleSubmit(submitLogin)()
  }

  return (
    <form onSubmit={onFormSubmit} noValidate className="flex flex-col gap-4">
      <StepIndicator steps={ru.auth.login.steps} current={step} />
      <StepTransition stepKey={step} direction={direction}>
        <div className="flex flex-col gap-4">
          {step === 0 && (
            <Input
              id="email"
              type="email"
              label={ru.auth.login.emailLabel}
              placeholder={ru.auth.login.emailPlaceholder}
              autoComplete="email"
              autoFocus
              error={errors.email?.message}
              {...register("email")}
            />
          )}
          {step === 1 && (
            <PasswordInput
              id="password"
              label={ru.auth.login.passwordLabel}
              autoComplete="current-password"
              autoFocus
              showLabel={ru.auth.common.showPassword}
              hideLabel={ru.auth.common.hidePassword}
              error={errors.password?.message}
              {...register("password")}
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
          {step < LAST_STEP ? ru.auth.common.next : ru.auth.login.submit}
        </Button>
      </div>
      {step === LAST_STEP && (
        <Link
          href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
          className="text-center text-sm font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
        >
          {ru.auth.login.forgotPassword}
        </Link>
      )}
    </form>
  )
}
