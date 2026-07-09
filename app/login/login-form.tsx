"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import ru from "@/src/i18n/ru.json"
import {
  emailFormSchema,
  otpFormSchema,
  type EmailFormValues,
  type OtpFormValues,
} from "@/src/lib/auth-schemas"

type LoginStep = "email" | "otp"

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

async function requestOtp(email: string): Promise<string | null> {
  const res = await fetch("/api/auth/otp-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  return res.ok ? null : readErrorMessage(res)
}

export function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<LoginStep>("email")
  const [email, setEmail] = useState("")
  const [serverError, setServerError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { email: "" },
  })

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp_code: "" },
  })

  const onEmailSubmit = emailForm.handleSubmit(async (values) => {
    setServerError(null)
    try {
      const error = await requestOtp(values.email)
      if (error) {
        setServerError(error)
        return
      }
      setEmail(values.email)
      setStep("otp")
    } catch {
      toast.error(ru.auth.errors.network)
    }
  })

  const onOtpSubmit = otpForm.handleSubmit(async (values) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/otp-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: values.otp_code }),
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

  const onResend = async () => {
    setServerError(null)
    setResending(true)
    try {
      const error = await requestOtp(email)
      if (error) {
        setServerError(error)
      } else {
        toast.success(ru.auth.login.resendDone)
      }
    } catch {
      toast.error(ru.auth.errors.network)
    } finally {
      setResending(false)
    }
  }

  const onChangeEmail = () => {
    setServerError(null)
    otpForm.reset()
    setStep("email")
  }

  const serverErrorBlock = serverError && (
    <p
      className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
      role="alert"
    >
      {serverError}
    </p>
  )

  if (step === "email") {
    return (
      <form onSubmit={onEmailSubmit} noValidate className="flex flex-col gap-4">
        <Input
          id="email"
          type="email"
          label={ru.auth.login.emailLabel}
          placeholder={ru.auth.login.emailPlaceholder}
          autoComplete="email"
          error={emailForm.formState.errors.email?.message}
          {...emailForm.register("email")}
        />
        {serverErrorBlock}
        <Button
          type="submit"
          loading={emailForm.formState.isSubmitting}
          className="mt-1"
        >
          {ru.auth.login.submitEmail}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={onOtpSubmit} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-fg-muted">
        {ru.auth.login.otpSentPrefix}{" "}
        <span className="font-medium text-fg">{email}</span>
      </p>
      <Input
        id="otp_code"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        label={ru.auth.login.otpLabel}
        placeholder={ru.auth.login.otpPlaceholder}
        className="font-mono tracking-[0.3em]"
        error={otpForm.formState.errors.otp_code?.message}
        {...otpForm.register("otp_code")}
      />
      {serverErrorBlock}
      <Button
        type="submit"
        loading={otpForm.formState.isSubmitting}
        className="mt-1"
      >
        {ru.auth.login.submitOtp}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onResend}
          disabled={resending}
          className="text-fg-muted transition-colors hover:text-fg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {ru.auth.login.resend}
        </button>
        <button
          type="button"
          onClick={onChangeEmail}
          className="font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
        >
          {ru.auth.login.changeEmail}
        </button>
      </div>
    </form>
  )
}
