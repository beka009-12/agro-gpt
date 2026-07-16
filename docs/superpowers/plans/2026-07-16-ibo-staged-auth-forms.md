# Staged Login/Register Forms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the single-page register (6 fields) and login (2 fields) forms into multi-step wizards — register: contacts → password → language; login: identifier → password — with password as its own dedicated step, on top of the existing v4 visual system.

**Architecture:** One `react-hook-form` instance per form spans all steps (values persist across "Назад"); a single `<form onSubmit>` branches by current step — `step < LAST_STEP` triggers per-step field validation and advances, the last step performs the real network request (unchanged from current behavior). New presentational components (`StepIndicator`, `StepTransition`, `PasswordInput`) are shared between register and login; `Button` gets an additive `variant` prop for the "Назад" ghost button.

**Tech Stack:** Next.js 16.2.10 (App Router), React 19, TypeScript strict, Tailwind 4, react-hook-form + `@hookform/resolvers/zod`, `motion/react` (already used in `profile-menu.tsx` for the same reduced-motion/AnimatePresence pattern). Package manager — **bun**.

**Spec:** `docs/superpowers/specs/2026-07-16-ibo-staged-auth-forms-design.md`

**Отступления от спеки:** нет — план 1:1 реализует спеку.

## Global Constraints

- Никакого `any`; интерфейсы для всех props; только `async/await`
- Имена файлов — kebab-case
- Все пользовательские тексты — из `src/i18n/{ru,ky,en}.json`; структура ключей `auth.*` должна остаться идентичной во всех трёх файлах (`Dictionary = typeof ru` в `src/i18n/dictionaries.ts`)
- Палитра/шрифт — только существующие v4-токены (`bg-accent`, `bg-mint-soft`, `border-edge`, `text-fg-muted`, `font-mono`, Plus Jakarta Sans через `font-sans`) — никакой новой палитры
- Анимация — на существующих токенах `DURATION`/`EASE_OUT` из `src/lib/motion-tokens.ts`, с уважением `useReducedMotion()` (тот же паттерн, что уже в `src/components/layout/profile-menu.tsx`)
- В проекте нет тест-раннера — верификация каждой задачи: `bunx tsc --noEmit`; финальная задача — `bun run lint`, `bun run build` и ручная проверка в браузере
- Коммиты: Conventional Commits, английский язык

---

### Task 1: Shared primitives — Eye icons и `Button` variant

**Files:**
- Modify: `src/components/ui/icons.tsx` (добавить в конец файла)
- Modify: `src/components/ui/button.tsx`

**Interfaces:**
- Produces: `EyeIcon(props: IconProps)`, `EyeOffIcon(props: IconProps)` — тот же контракт, что у существующих иконок в файле (`IconProps` уже экспортирован)
- Produces: `Button` — новый опциональный проп `variant?: "primary" | "ghost"` (default `"primary"`, полностью обратно совместим — существующие вызовы без `variant` рендерятся идентично)

- [ ] **Step 1: Добавить `EyeIcon`/`EyeOffIcon` в конец `src/components/ui/icons.tsx`**

```bash
cat >> src/components/ui/icons.tsx << 'EOF'

export function EyeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M2.5 12S5.5 5.5 12 5.5 21.5 12 21.5 12 18.5 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  )
}

export function EyeOffIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.63A9.53 9.53 0 0 1 12 5.5c6.5 0 9.5 6.5 9.5 6.5a14.5 14.5 0 0 1-3.1 3.9M6.6 6.6C4 8.3 2.5 12 2.5 12S5.5 18.5 12 18.5c1.3 0 2.5-.24 3.55-.66" />
      <path d="M9.9 10.1a3 3 0 0 0 4 4" />
    </IconBase>
  )
}
EOF
```

- [ ] **Step 2: Проверить типы**

Run: `bunx tsc --noEmit`
Expected: без ошибок

- [ ] **Step 3: Переписать `src/components/ui/button.tsx`**

```tsx
import type { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: "primary" | "ghost"
}

const VARIANT_CLASSES = {
  primary:
    "bg-accent text-white hover:bg-accent-strong disabled:hover:bg-accent",
  ghost:
    "bg-transparent text-fg-muted hover:bg-mint-soft disabled:hover:bg-transparent",
} as const

export function Button({
  loading = false,
  disabled,
  variant = "primary",
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
          aria-hidden
        />
      )}
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Проверить типы**

Run: `bunx tsc --noEmit`
Expected: без ошибок (существующие использования `Button` в `register-form.tsx`, `login-form.tsx`, `forgot-password-form.tsx`, `reset-password-form.tsx`, `profile-menu.tsx` не передают `variant` — рендер не меняется)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/icons.tsx src/components/ui/button.tsx
git commit -m "feat: add eye icons and ghost variant to Button"
```

---

### Task 2: `PasswordInput` — поле пароля с show/hide

**Files:**
- Create: `src/components/ui/password-input.tsx`

**Interfaces:**
- Consumes: `EyeIcon`, `EyeOffIcon` из `src/components/ui/icons.tsx` (Task 1)
- Produces: `PasswordInput` — `Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; error?: string; hint?: string; warning?: string; showLabel: string; hideLabel: string; ref?: Ref<HTMLInputElement> }`. Используется в Task 5 (register), Task 6 (login), Task 7 (reset-password)

- [ ] **Step 1: Создать `src/components/ui/password-input.tsx`**

```tsx
"use client"

import { useState, type InputHTMLAttributes, type Ref } from "react"
import { EyeIcon, EyeOffIcon } from "@/src/components/ui/icons"

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string
  error?: string
  hint?: string
  warning?: string
  showLabel: string
  hideLabel: string
  ref?: Ref<HTMLInputElement>
}

export function PasswordInput({
  label,
  error,
  hint,
  warning,
  showLabel,
  hideLabel,
  id,
  className = "",
  ref,
  ...rest
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          ref={ref}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          className={`w-full rounded-xl border bg-card px-4 py-3 pr-11 text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-accent focus:ring-2 focus:ring-accent/25 ${
            error ? "border-danger/60" : "border-edge"
          } ${className}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          className="absolute inset-y-0 right-3.5 flex items-center text-fg-faint transition-colors hover:text-fg-muted"
        >
          {visible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : warning ? (
        <p className="text-xs text-amber-700">{warning}</p>
      ) : hint ? (
        <p className="text-xs text-fg-muted">{hint}</p>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 2: Проверить типы**

Run: `bunx tsc --noEmit`
Expected: без ошибок

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/password-input.tsx
git commit -m "feat: add PasswordInput component with show/hide toggle"
```

---

### Task 3: `StepIndicator` и `StepTransition`

**Files:**
- Create: `src/components/auth/step-indicator.tsx`
- Create: `src/components/auth/step-transition.tsx`

**Interfaces:**
- Produces: `StepIndicator({ steps: readonly string[]; current: number })` — презентационный, без стейта
- Produces: `StepTransition({ stepKey: number; direction: 1 | -1; children: ReactNode })` — используется в Task 5/6 вокруг полей текущего шага

- [ ] **Step 1: Создать `src/components/auth/step-indicator.tsx`**

```tsx
interface StepIndicatorProps {
  steps: readonly string[]
  current: number
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="mb-2">
      <p className="mb-2 font-mono text-xs uppercase tracking-wide text-fg-muted">
        {steps[current]} — {current + 1} / {steps.length}
      </p>
      <div className="flex gap-1.5">
        {steps.map((step, index) => (
          <span
            key={step}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              index <= current ? "bg-accent" : "bg-mint-soft"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Создать `src/components/auth/step-transition.tsx`**

```tsx
"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens"

interface StepTransitionProps {
  stepKey: number
  direction: 1 | -1
  children: ReactNode
}

export function StepTransition({
  stepKey,
  direction,
  children,
}: StepTransitionProps) {
  const reduced = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={reduced ? { opacity: 0 } : { x: 24 * direction, opacity: 0 }}
        animate={reduced ? { opacity: 1 } : { x: 0, opacity: 1 }}
        exit={reduced ? { opacity: 0 } : { x: -24 * direction, opacity: 0 }}
        transition={{ duration: DURATION.base, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Проверить типы**

Run: `bunx tsc --noEmit`
Expected: без ошибок

- [ ] **Step 4: Commit**

```bash
git add src/components/auth/step-indicator.tsx src/components/auth/step-transition.tsx
git commit -m "feat: add StepIndicator and StepTransition components"
```

---

### Task 4: i18n — подписи шагов и общие ключи `auth.common`

**Files:**
- Modify: `src/i18n/ru.json`, `src/i18n/ky.json`, `src/i18n/en.json`

**Interfaces:**
- Produces: `dict.auth.register.steps: string[]` (3 элемента), `dict.auth.login.steps: string[]` (2 элемента), `dict.auth.common.{back,next,showPassword,hidePassword}: string` — потребляются в Task 5/6 (steps, back/next) и Task 5/6/7 (showPassword/hidePassword через `PasswordInput`)

- [ ] **Step 1: В `src/i18n/ru.json` добавить `"steps"` в `auth.register` (сразу после `"subtitle"`)**

```json
      "subtitle": "Пара полей — и AI-агроном уже работает на вас.",
      "steps": ["Контакты", "Пароль", "Язык"],
```

- [ ] **Step 2: В `src/i18n/ru.json` добавить `"steps"` в `auth.login` (сразу после `"subtitle"`)**

```json
      "subtitle": "Введите телефон или email и пароль.",
      "steps": ["Телефон или email", "Пароль"],
```

- [ ] **Step 3: В `src/i18n/ru.json` добавить объект `"common"` в `auth` — сразу после закрытия `"resetPassword": { ... }` (перед `"errors"`)**

```json
    "common": {
      "back": "Назад",
      "next": "Далее",
      "showPassword": "Показать пароль",
      "hidePassword": "Скрыть пароль"
    },
```

- [ ] **Step 4: Повторить шаги 1–3 для `src/i18n/en.json`**

`register.steps`: `["Contacts", "Password", "Language"]` (после `"subtitle": "A couple of fields — and the AI agronomist is working for you."`)

`login.steps`: `["Phone or email", "Password"]` (после `"subtitle": "Enter your phone or email and password."`)

`auth.common`:
```json
    "common": {
      "back": "Back",
      "next": "Next",
      "showPassword": "Show password",
      "hidePassword": "Hide password"
    },
```

- [ ] **Step 5: Повторить шаги 1–3 для `src/i18n/ky.json`**

`register.steps`: `["Байланыш", "Сырсөз", "Тил"]` (после `"subtitle": "Бир-эки талаа — жана AI-агроном сиз үчүн иштеп баштайт."`)

`login.steps`: `["Телефон же email", "Сырсөз"]` (после `"subtitle": "Телефон же email жана сырсөздү киргизиңиз."`)

`auth.common`:
```json
    "common": {
      "back": "Артка",
      "next": "Кийинки",
      "showPassword": "Сырсөздү көрсөтүү",
      "hidePassword": "Сырсөздү жашыруу"
    },
```

- [ ] **Step 6: Валидировать JSON и типы**

```bash
python3 -c "import json; [json.load(open(f'src/i18n/{f}.json')) for f in ('ru','ky','en')]; print('OK')"
bunx tsc --noEmit
```

Expected: `OK`, затем без ошибок (структура ключей идентична во всех трёх файлах — иначе `tsc` укажет на несовпадение типов `Dictionary` в `src/i18n/dictionaries.ts`)

- [ ] **Step 7: Commit**

```bash
git add src/i18n/ru.json src/i18n/ky.json src/i18n/en.json
git commit -m "feat: add step labels and shared back/next/password-toggle i18n keys"
```

---

### Task 5: Register — 3-шаговый визард

**Files:**
- Modify: `app/register/register-form.tsx`

**Interfaces:**
- Consumes: `StepIndicator`, `StepTransition` (Task 3), `PasswordInput` (Task 2), `Button` с `variant="ghost"` (Task 1), `dict.auth.register.steps`, `dict.auth.common.*` (Task 4)
- Produces: не меняет публичный контракт `RegisterForm` (без props) и не меняет payload, который уходит на `/api/auth/register` (те же поля `RegisterFormValues`)

- [ ] **Step 1: Переписать `app/register/register-form.tsx`**

```tsx
"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
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
  ["full_name", "phone", "email"],
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
    control,
    trigger,
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
  }

  // react-hook-form's handleSubmit() always validates the FULL zod schema
  // (all three steps' fields) before invoking its callback — so on step 0
  // it would block on step 1/2's still-empty fields and never call our
  // step-branching logic. Branch BEFORE touching handleSubmit; only the
  // true final step needs (and gets) full-schema validation.
  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
```

- [ ] **Step 2: Проверить типы**

Run: `bunx tsc --noEmit`
Expected: без ошибок

- [ ] **Step 3: Commit**

```bash
git add app/register/register-form.tsx
git commit -m "feat: turn register form into a 3-step wizard"
```

---

### Task 6: Login — 2-шаговый визард

**Files:**
- Modify: `app/login/login-form.tsx`

**Interfaces:**
- Consumes: то же, что Task 5, плюс `dict.auth.login.steps`
- Produces: не меняет публичный контракт `LoginForm` и payload на `/api/auth/login`

- [ ] **Step 1: Переписать `app/login/login-form.tsx`**

```tsx
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

const STEP_FIELDS: (keyof LoginFormValues)[][] = [["identifier"], ["password"]]

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
  const initialIdentifier = searchParams.get("identifier") ?? ""
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
    defaultValues: { identifier: initialIdentifier, password: "" },
  })

  const identifier = useWatch({ control, name: "identifier" })

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
              id="identifier"
              label={ru.auth.login.identifierLabel}
              placeholder={ru.auth.login.identifierPlaceholder}
              autoComplete="username"
              autoFocus
              error={errors.identifier?.message}
              {...register("identifier")}
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
          href={`/forgot-password${identifier ? `?identifier=${encodeURIComponent(identifier)}` : ""}`}
          className="text-center text-sm font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
        >
          {ru.auth.login.forgotPassword}
        </Link>
      )}
    </form>
  )
}
```

- [ ] **Step 2: Проверить типы**

Run: `bunx tsc --noEmit`
Expected: без ошибок

- [ ] **Step 3: Commit**

```bash
git add app/login/login-form.tsx
git commit -m "feat: turn login form into a 2-step wizard"
```

---

### Task 7: Reset-password — `PasswordInput` вместо обычного поля

**Files:**
- Modify: `app/reset-password/reset-password-form.tsx`

**Interfaces:**
- Consumes: `PasswordInput` (Task 2), `dict.auth.common.showPassword/hidePassword` (Task 4)

- [ ] **Step 1: Добавить импорт `PasswordInput`**

В `app/reset-password/reset-password-form.tsx` заменить:
```tsx
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
```
на:
```tsx
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { PasswordInput } from "@/src/components/ui/password-input"
```

- [ ] **Step 2: Заменить поля пароля**

Заменить:
```tsx
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
```
на:
```tsx
      <PasswordInput
        id="new_password"
        label={ru.auth.resetPassword.newPasswordLabel}
        autoComplete="new-password"
        showLabel={ru.auth.common.showPassword}
        hideLabel={ru.auth.common.hidePassword}
        error={errors.new_password?.message}
        {...register("new_password")}
      />
      <PasswordInput
        id="confirm_password"
        label={ru.auth.resetPassword.confirmPasswordLabel}
        autoComplete="new-password"
        showLabel={ru.auth.common.showPassword}
        hideLabel={ru.auth.common.hidePassword}
        error={errors.confirm_password?.message}
        {...register("confirm_password")}
      />
```

- [ ] **Step 3: Проверить типы**

Run: `bunx tsc --noEmit`
Expected: без ошибок

- [ ] **Step 4: Commit**

```bash
git add app/reset-password/reset-password-form.tsx
git commit -m "feat: use PasswordInput in reset-password form"
```

---

### Task 8: Финальная проверка

**Files:** нет новых — только верификация

- [ ] **Step 1: Полный чистый прогон**

```bash
bunx tsc --noEmit
bun run lint
bun run build
```

Expected: все три команды завершаются без ошибок

- [ ] **Step 2: Ручная приёмка в браузере** (`bun run dev`, открыть `/register` и `/login`)

1. `/register`: шаг 1 (имя/телефон/email) → «Далее» без имени → ошибка валидации, не пускает дальше; заполнить → «Далее» → StepIndicator показывает шаг 2/3 «Пароль»
2. Шаг 2: ввести несовпадающие пароли → «Далее» → ошибка «Пароли не совпадают» на поле повтора; клик по иконке глаза — пароль показывается/скрывается; ввести совпадающие → «Далее» → шаг 3/3 «Язык»
3. «Назад» с шага 3 → возвращает на шаг 2, значения пароля сохранены (не очистились)
4. Шаг 3 → «Создать аккаунт» → сеть/бэк отрабатывает как раньше (cookie, редирект на `/chat`)
5. `/login`: шаг 1 (идентификатор) → «Далее» → шаг 2 (пароль) → «Забыли пароль?» ведёт на `/forgot-password?identifier=...`
6. `/login` шаг 2 → «Войти» с верными данными → `/chat`
7. Открыть DevTools → эмулировать `prefers-reduced-motion: reduce` → переходы между шагами становятся мгновенным fade без сдвига
8. Проверить на 360px / 768px / 1440px — форма не переполняется, кнопки не наезжают друг на друга

- [ ] **Step 3: Commit (если по итогам ручной проверки потребовались правки)**

```bash
git add -A
git commit -m "fix: address manual QA findings from staged auth forms"
```
