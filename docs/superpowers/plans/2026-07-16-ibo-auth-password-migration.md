# ibo Auth Password Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести фронт ibo с OTP-passwordless авторизации на пароль (`register`/`login`/`logout` + `forgot-password`/`reset-password`), синхронизировав orval-клиент со свежим `openapi.json` бэка.

**Architecture:** Браузер по-прежнему ходит только в наши Route Handlers (`app/api/auth/*`, `app/api/profile*`), те проксируют во внешний AI Agro API (`API_URL`) и ставят httpOnly cookies — контракт `api-server.ts`/`auth-cookies.ts` не меняется, меняются только пути и пейлоады. Идентификатор на логине/forgot-password — одно текстовое поле, которое `splitIdentifier()` превращает в `{ phone }` или `{ email }` по формату (используем существующий `PHONE_REGEX`).

**Tech Stack:** Next.js 16.2.10 (App Router, `proxy.ts` — переименованный `middleware.ts`), React 19, TypeScript strict, Tailwind 4, zod v4, react-hook-form + `@hookform/resolvers`, react-hot-toast. Пакетный менеджер — **bun**. Codegen — orval v8 (`tags-split`, react-query + axios, `customInstance` в `src/api/index.ts`).

**Spec:** `docs/superpowers/specs/2026-07-15-ibo-auth-password-migration-design.md`

**Отступления от спеки:** нет — спека покрывает всё 1:1.

## Global Constraints

- Никакого `any`; интерфейсы для всех props/DTO; только `async/await`
- Имена файлов — kebab-case
- Все пользовательские тексты — из `src/i18n/{ru,ky,en}.json` (раздел `auth`), не хардкодить в компонентах (кроме `metadata` в `page.tsx` — так уже сделано в проекте)
- `Dictionary = typeof ru` (`src/i18n/dictionaries.ts`) — структура ключей `auth.*` должна быть **идентичной** во всех трёх JSON, иначе `bunx tsc --noEmit` упадёт
- `cookies()` в Next 16 — async: всегда `const store = await cookies()`
- Ошибки роутов: клиенту статус + `{ message, errors? }`; в консоль — `console.error`; 401 от бэка → чистить cookies (уже реализовано в `api/profile/route.ts`, не трогать)
- Ответы `/api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password` не типизированы в OpenAPI (`schema: {}`) — парсить защитно через `loginResponseSchema` (обязателен только `access_token`), по аналогии с уже существующим кодом
- В проекте нет тест-раннера — верификация каждой задачи: `bunx tsc --noEmit` (чисто); финальная задача — `bun run lint`, `bun run build` и ручные curl/live-flow проверки
- Коммиты: Conventional Commits, английский язык

---

### Task 1: Синхронизация OpenAPI-спеки и orval-клиента

**Files:**
- Modify: `openapi.json` (перезаписать целиком)
- Modify/Create: `src/api/generated/**` (регенерируется orval)
- Delete: `src/api/generated/endpoints/user/` и осиротевшие модели (список в Step 4)

**Interfaces:**
- Consumes: живой бэк `http://167.233.203.129/openapi.json`
- Produces: новые generated-типы `RegisterRequest`, `LoginRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest`, обновлённые `UpdateProfileRequest`/`UpdateLocationRequest` (без `region`) — последующие задачи их **не импортируют напрямую** (route handlers продолжают строить JSON-пейлоады вручную, как и раньше), но их наличие в `src/api/generated/models/index.ts` подтверждает успешную синхронизацию

- [ ] **Step 1: Перезаписать `openapi.json` свежей спекой с бэка**

```bash
curl -s http://167.233.203.129/openapi.json -o openapi.json
```

Expected: команда завершается без ошибок; `git diff --stat openapi.json` показывает изменения (пути `/user/*` пропадают, появляются `/api/auth/*`, `/api/profile*`)

- [ ] **Step 2: Прогнать orval**

```bash
bun run generate-api
```

Expected: в выводе orval видно генерацию файлов под тегами `Auth` и `Profile` (а не `User`); команда завершается с exit code 0

- [ ] **Step 3: Проверить новую структуру**

```bash
ls src/api/generated/endpoints
ls src/api/generated/models | grep -iE "register|login|forgot|reset"
```

Expected: `endpoints/` содержит `auth/` и `profile/` (плюс нетронутые `chat/`, `diagnosis/`, `health/`, `sessions/`); `models/` содержит новые `registerRequest.ts`, `loginRequest.ts`, `forgotPasswordRequest.ts`, `resetPasswordRequest.ts`

- [ ] **Step 4: Удалить осиротевший `user`-эндпоинт и его модели**

Orval не удаляет файлы для эндпоинтов, которых больше нет в спеке — `endpoints/user/` и часть моделей остаются на диске неиспользуемыми:

```bash
rm -rf src/api/generated/endpoints/user
rm -f src/api/generated/models/userInputSchema.ts \
      src/api/generated/models/userOutSchema.ts \
      src/api/generated/models/emailLoginRequest.ts \
      src/api/generated/models/oTPVerifyRequest.ts \
      src/api/generated/models/loginResponse.ts \
      src/api/generated/models/updateLanguageRequest.ts \
      src/api/generated/models/listUsersUserGetParams.ts \
      src/api/generated/models/logoutUserLogoutPostParams.ts \
      src/api/generated/models/language.ts
```

- [ ] **Step 5: Проверить `models/index.ts` на осиротевшие экспорты**

```bash
grep -nE "userInputSchema|userOutSchema|emailLoginRequest|oTPVerifyRequest|loginResponse|updateLanguageRequest|listUsersUserGetParams|logoutUserLogoutPostParams|'./language'" src/api/generated/models/index.ts
```

Expected: пусто (orval перегенерировал `index.ts` с нуля из текущей спеки). Если grep что-то нашёл — удалить соответствующие строки `export * from '...'` вручную из `src/api/generated/models/index.ts`.

- [ ] **Step 6: Проверить типы**

```bash
bunx tsc --noEmit
```

Expected: без ошибок (если тут всплывут `TS2307: Cannot find module`, значит где-то в проекте остался импорт удалённого файла — найти его через `grep -rn "<имя_модели>" src app` и разобраться, прежде чем продолжать)

- [ ] **Step 7: Commit**

```bash
git add openapi.json src/api/generated
git commit -m "chore: sync openapi spec and regenerate orval client for password auth"
```

---

### Task 2: Общие zod-схемы и i18n-тексты

**Files:**
- Modify: `src/lib/auth-schemas.ts`
- Modify: `src/lib/profile-schemas.ts`
- Modify: `src/i18n/ru.json`, `src/i18n/ky.json`, `src/i18n/en.json`

**Interfaces:**
- Consumes: `Dictionary` тип из `src/i18n/dictionaries.ts`
- Produces (для задач 3–7):
  - `isPhoneLike(value: string): boolean`, `splitIdentifier(value: string): { phone?: string; email?: string }`
  - `makeRegisterFormSchema(dict)` → `RegisterFormValues = { full_name, phone, email, password, confirm_password, language }`
  - `makeLoginFormSchema(dict)` → `LoginFormValues = { identifier, password }`
  - `makeForgotPasswordFormSchema(dict)` → `ForgotPasswordFormValues = { identifier }`
  - `makeResetPasswordFormSchema(dict)` → `ResetPasswordFormValues = { identifier, reset_code, new_password, confirm_password }`
  - `loginResponseSchema` — без изменений в форме (только `access_token` обязателен)
  - `makeProfileFormSchema(dict)` → `ProfileFormValues = { full_name, phone, email }` (без `region`)
  - `userProfileSchema` → `UserProfile` без поля `region`
  - `dict.auth.login/forgotPassword/resetPassword/register/errors.*` — новые/изменённые ключи (см. Step 3)

- [ ] **Step 1: Переписать `src/lib/auth-schemas.ts`**

```ts
import { z } from "zod"
import type { Dictionary } from "@/src/i18n/dictionaries"

const PHONE_REGEX = /^\+?\d{9,15}$/

export function isPhoneLike(value: string): boolean {
  return PHONE_REGEX.test(value.trim())
}

export function splitIdentifier(value: string): { phone?: string; email?: string } {
  const trimmed = value.trim()
  return isPhoneLike(trimmed) ? { phone: trimmed } : { email: trimmed }
}

export function makeRegisterFormSchema(dict: Dictionary) {
  const e = dict.auth.errors
  return z
    .object({
      full_name: z.string().trim().min(2, e.nameMin),
      phone: z.string().trim().regex(PHONE_REGEX, e.phoneFormat),
      email: z.union([z.email(e.emailFormat), z.literal("")]),
      password: z.string().min(8, e.passwordMin),
      confirm_password: z.string().min(1, e.passwordRequired),
      language: z.enum(["ky", "ru", "en"]),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: e.passwordMismatch,
      path: ["confirm_password"],
    })
}

export type RegisterFormValues = z.infer<
  ReturnType<typeof makeRegisterFormSchema>
>

export function makeLoginFormSchema(dict: Dictionary) {
  const e = dict.auth.errors
  return z.object({
    identifier: z.string().trim().min(1, e.identifierRequired),
    password: z.string().min(1, e.passwordRequired),
  })
}

export type LoginFormValues = z.infer<ReturnType<typeof makeLoginFormSchema>>

export function makeForgotPasswordFormSchema(dict: Dictionary) {
  return z.object({
    identifier: z.string().trim().min(1, dict.auth.errors.identifierRequired),
  })
}

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof makeForgotPasswordFormSchema>
>

export function makeResetPasswordFormSchema(dict: Dictionary) {
  const e = dict.auth.errors
  return z
    .object({
      identifier: z.string().trim().min(1, e.identifierRequired),
      reset_code: z.string().trim().min(1, e.resetCodeRequired),
      new_password: z.string().min(8, e.passwordMin),
      confirm_password: z.string().min(1, e.passwordRequired),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: e.passwordMismatch,
      path: ["confirm_password"],
    })
}

export type ResetPasswordFormValues = z.infer<
  ReturnType<typeof makeResetPasswordFormSchema>
>

// Ответ /api/auth/register и /api/auth/login не типизирован в OpenAPI —
// парсим защитно: обязателен только access_token
export const loginResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_at: z.string().optional(),
  full_name: z.string().optional(),
  language: z.string().optional(),
  user_id: z.string().optional(),
})
```

- [ ] **Step 2: Переписать `src/lib/profile-schemas.ts`**

```ts
import { z } from "zod"
import type { Dictionary } from "@/src/i18n/dictionaries"

const PHONE_REGEX = /^\+?\d{9,15}$/

export const userProfileSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  language: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  location_available: z.boolean().default(false),
})

export type UserProfile = z.infer<typeof userProfileSchema>

export function makeProfileFormSchema(dict: Dictionary) {
  const e = dict.auth.errors
  return z.object({
    full_name: z.string().trim().min(2, e.nameMin),
    phone: z.string().trim().regex(PHONE_REGEX, e.phoneFormat),
    email: z.union([z.email(e.emailFormat), z.literal("")]),
  })
}

export type ProfileFormValues = z.infer<
  ReturnType<typeof makeProfileFormSchema>
>

export const locationDtoSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})
```

- [ ] **Step 3: Заменить раздел `auth` в `src/i18n/ru.json`**

Найти существующий верхнеуровневый ключ `"auth": { ... }` и заменить его целиком на:

```json
"auth": {
  "register": {
    "title": "Создайте аккаунт",
    "subtitle": "Пара полей — и AI-агроном уже работает на вас.",
    "nameLabel": "Имя",
    "namePlaceholder": "Асан Асанов",
    "phoneLabel": "Телефон",
    "phonePlaceholder": "+996700123456",
    "emailLabel": "Email",
    "emailPlaceholder": "you@example.com",
    "emailHint": "Нужен для повторного входа",
    "emailWarning": "Без email вы не сможете войти в аккаунт с другого устройства",
    "passwordLabel": "Пароль",
    "passwordPlaceholder": "Минимум 8 символов",
    "confirmPasswordLabel": "Повторите пароль",
    "languageLabel": "Язык ответов",
    "submit": "Создать аккаунт",
    "haveAccount": "Уже есть аккаунт?",
    "loginLink": "Войти",
    "alreadyRegistered": "Этот номер уже зарегистрирован. Переходим ко входу."
  },
  "login": {
    "title": "Вход в ibo",
    "subtitle": "Введите телефон или email и пароль.",
    "identifierLabel": "Телефон или email",
    "identifierPlaceholder": "+996700123456 или you@example.com",
    "passwordLabel": "Пароль",
    "submit": "Войти",
    "forgotPassword": "Забыли пароль?",
    "noAccount": "Нет аккаунта?",
    "registerLink": "Создать аккаунт"
  },
  "forgotPassword": {
    "title": "Забыли пароль",
    "subtitle": "Укажите телефон или email — отправим код для сброса пароля.",
    "identifierLabel": "Телефон или email",
    "identifierPlaceholder": "+996700123456 или you@example.com",
    "submit": "Отправить код",
    "sent": "Если аккаунт существует, код отправлен",
    "backToLogin": "Вернуться ко входу"
  },
  "resetPassword": {
    "title": "Новый пароль",
    "subtitle": "Введите код из письма/SMS и новый пароль.",
    "identifierLabel": "Телефон или email",
    "identifierPlaceholder": "+996700123456 или you@example.com",
    "codeLabel": "Код сброса",
    "codePlaceholder": "123456",
    "newPasswordLabel": "Новый пароль",
    "confirmPasswordLabel": "Повторите пароль",
    "submit": "Сохранить пароль",
    "success": "Пароль обновлён — теперь войдите с новым паролем",
    "backToLogin": "Вернуться ко входу"
  },
  "errors": {
    "nameMin": "Имя — минимум 2 символа",
    "phoneFormat": "Телефон: 9–15 цифр, можно с +",
    "emailFormat": "Проверьте формат email",
    "passwordMin": "Пароль — минимум 8 символов",
    "passwordMismatch": "Пароли не совпадают",
    "passwordRequired": "Введите пароль",
    "identifierRequired": "Введите телефон или email",
    "resetCodeRequired": "Введите код из письма/SMS",
    "network": "Нет соединения. Проверьте интернет",
    "unavailable": "Сервис временно недоступен",
    "checkData": "Проверьте правильность данных",
    "unexpectedResponse": "Сервер вернул неожиданный ответ",
    "unauthorized": "Сессия истекла — войдите снова"
  }
}
```

- [ ] **Step 4: Заменить раздел `auth` в `src/i18n/en.json`** (та же структура ключей, что в Step 3)

```json
"auth": {
  "register": {
    "title": "Create an account",
    "subtitle": "A couple of fields — and the AI agronomist is working for you.",
    "nameLabel": "Name",
    "namePlaceholder": "Asan Asanov",
    "phoneLabel": "Phone",
    "phonePlaceholder": "+996700123456",
    "emailLabel": "Email",
    "emailPlaceholder": "you@example.com",
    "emailHint": "Needed to sign in again",
    "emailWarning": "Without an email you won't be able to sign in from another device",
    "passwordLabel": "Password",
    "passwordPlaceholder": "At least 8 characters",
    "confirmPasswordLabel": "Confirm password",
    "languageLabel": "Answer language",
    "submit": "Create account",
    "haveAccount": "Already have an account?",
    "loginLink": "Sign in",
    "alreadyRegistered": "This number is already registered. Taking you to sign in."
  },
  "login": {
    "title": "Sign in to ibo",
    "subtitle": "Enter your phone or email and password.",
    "identifierLabel": "Phone or email",
    "identifierPlaceholder": "+996700123456 or you@example.com",
    "passwordLabel": "Password",
    "submit": "Sign in",
    "forgotPassword": "Forgot password?",
    "noAccount": "No account?",
    "registerLink": "Create account"
  },
  "forgotPassword": {
    "title": "Forgot password",
    "subtitle": "Enter your phone or email — we'll send a reset code.",
    "identifierLabel": "Phone or email",
    "identifierPlaceholder": "+996700123456 or you@example.com",
    "submit": "Send code",
    "sent": "If an account exists, a code has been sent",
    "backToLogin": "Back to sign in"
  },
  "resetPassword": {
    "title": "New password",
    "subtitle": "Enter the code from the email/SMS and a new password.",
    "identifierLabel": "Phone or email",
    "identifierPlaceholder": "+996700123456 or you@example.com",
    "codeLabel": "Reset code",
    "codePlaceholder": "123456",
    "newPasswordLabel": "New password",
    "confirmPasswordLabel": "Confirm password",
    "submit": "Save password",
    "success": "Password updated — sign in with your new password",
    "backToLogin": "Back to sign in"
  },
  "errors": {
    "nameMin": "Name must be at least 2 characters",
    "phoneFormat": "Phone: 9–15 digits, may start with +",
    "emailFormat": "Check the email format",
    "passwordMin": "Password must be at least 8 characters",
    "passwordMismatch": "Passwords do not match",
    "passwordRequired": "Enter your password",
    "identifierRequired": "Enter your phone or email",
    "resetCodeRequired": "Enter the code from the email/SMS",
    "network": "No connection. Check your internet",
    "unavailable": "Service is temporarily unavailable",
    "checkData": "Please check your data",
    "unexpectedResponse": "The server returned an unexpected response",
    "unauthorized": "Session expired — please sign in again"
  }
}
```

- [ ] **Step 5: Заменить раздел `auth` в `src/i18n/ky.json`** (та же структура ключей)

```json
"auth": {
  "register": {
    "title": "Аккаунт түзүңүз",
    "subtitle": "Бир-эки талаа — жана AI-агроном сиз үчүн иштеп баштайт.",
    "nameLabel": "Аты-жөнү",
    "namePlaceholder": "Асан Асанов",
    "phoneLabel": "Телефон",
    "phonePlaceholder": "+996700123456",
    "emailLabel": "Email",
    "emailPlaceholder": "you@example.com",
    "emailHint": "Кайра кирүү үчүн керек",
    "emailWarning": "Email жок болсо, башка түзмөктөн аккаунтуңузга кире албайсыз",
    "passwordLabel": "Сырсөз",
    "passwordPlaceholder": "Кеминде 8 белги",
    "confirmPasswordLabel": "Сырсөздү кайталаңыз",
    "languageLabel": "Жооп тили",
    "submit": "Аккаунт түзүү",
    "haveAccount": "Аккаунтуңуз барбы?",
    "loginLink": "Кирүү",
    "alreadyRegistered": "Бул номер мурунтан катталган. Кирүүгө өтөбүз."
  },
  "login": {
    "title": "ibo'го кирүү",
    "subtitle": "Телефон же email жана сырсөздү киргизиңиз.",
    "identifierLabel": "Телефон же email",
    "identifierPlaceholder": "+996700123456 же you@example.com",
    "passwordLabel": "Сырсөз",
    "submit": "Кирүү",
    "forgotPassword": "Сырсөздү унуттуңузбу?",
    "noAccount": "Аккаунт жокпу?",
    "registerLink": "Аккаунт түзүү"
  },
  "forgotPassword": {
    "title": "Сырсөздү унуттуңуз",
    "subtitle": "Телефон же email көрсөтүңүз — сброс коду жөнөтөбүз.",
    "identifierLabel": "Телефон же email",
    "identifierPlaceholder": "+996700123456 же you@example.com",
    "submit": "Код жөнөтүү",
    "sent": "Эгер аккаунт бар болсо, код жөнөтүлдү",
    "backToLogin": "Кирүүгө кайтуу"
  },
  "resetPassword": {
    "title": "Жаңы сырсөз",
    "subtitle": "Каттагы/SMS'теги кодду жана жаңы сырсөздү киргизиңиз.",
    "identifierLabel": "Телефон же email",
    "identifierPlaceholder": "+996700123456 же you@example.com",
    "codeLabel": "Сброс коду",
    "codePlaceholder": "123456",
    "newPasswordLabel": "Жаңы сырсөз",
    "confirmPasswordLabel": "Сырсөздү кайталаңыз",
    "submit": "Сырсөздү сактоо",
    "success": "Сырсөз жаңыртылды — жаңы сырсөз менен кириңиз",
    "backToLogin": "Кирүүгө кайтуу"
  },
  "errors": {
    "nameMin": "Аты-жөнү — кеминде 2 белги",
    "phoneFormat": "Телефон: 9–15 цифра, + менен болушу мүмкүн",
    "emailFormat": "Email форматын текшериңиз",
    "passwordMin": "Сырсөз — кеминде 8 белги",
    "passwordMismatch": "Сырсөздөр дал келген жок",
    "passwordRequired": "Сырсөздү киргизиңиз",
    "identifierRequired": "Телефон же email киргизиңиз",
    "resetCodeRequired": "Каттагы/SMS'теги кодду киргизиңиз",
    "network": "Байланыш жок. Интернетти текшериңиз",
    "unavailable": "Кызмат убактылуу жеткиликсиз",
    "checkData": "Маалыматтардын тууралыгын текшериңиз",
    "unexpectedResponse": "Сервер күтүлбөгөн жооп кайтарды",
    "unauthorized": "Сессия аяктады — кайра кириңиз"
  }
}
```

- [ ] **Step 6: Проверить типы**

```bash
bunx tsc --noEmit
```

Expected: без ошибок. Если `ky.json`/`en.json` разойдутся по структуре ключей с `ru.json` — здесь появится ошибка на `DICTIONARIES: Record<Locale, Dictionary>` в `src/i18n/dictionaries.ts`; сверить структуру трёх файлов заново.

Обратите внимание: на этом шаге `bunx tsc --noEmit` **упадёт** с ошибками в `app/register/register-form.tsx`, `app/login/login-form.tsx`, `src/components/layout/profile-menu.tsx` (они всё ещё используют старые поля `region`/`otp_code`/`makeEmailFormSchema` и т.п.) — это ожидаемо, их чинят задачи 3–7. Здесь важно, чтобы ошибок **не было** именно в `src/lib/auth-schemas.ts`, `src/lib/profile-schemas.ts` и трёх i18n-файлах.

- [ ] **Step 7: Commit**

```bash
git add src/lib/auth-schemas.ts src/lib/profile-schemas.ts src/i18n/ru.json src/i18n/ky.json src/i18n/en.json
git commit -m "feat: replace OTP auth schemas and i18n with password-based auth"
```

---

### Task 3: Регистрация — пароль вместо региона

**Files:**
- Modify: `app/register/register-form.tsx`

**Interfaces:**
- Consumes: `makeRegisterFormSchema`, `RegisterFormValues` из `src/lib/auth-schemas.ts` (Task 2)
- Produces: форма постит `RegisterFormValues` (включая `password`/`confirm_password`/`language`) на `/api/auth/register`. Роут-хендлер переписывается в Task 7 — до тех пор сквозная проверка через браузер невозможна, верификация этой задачи — только `tsc`/визуальный рендер полей формы

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
```

- [ ] **Step 2: Проверить типы**

```bash
bunx tsc --noEmit
```

Expected: `app/register/register-form.tsx` больше не в списке ошибок (остальные файлы из Task 2 warning — ещё могут быть, чинятся в задачах 4–7)

- [ ] **Step 3: Commit**

```bash
git add app/register/register-form.tsx
git commit -m "feat: add password fields to register form, drop region"
```

---

### Task 4: Логин — одношаговая форма вместо OTP

**Files:**
- Create: `app/api/auth/login/route.ts`
- Delete: `app/api/auth/otp-request/route.ts`, `app/api/auth/otp-verify/route.ts`
- Modify: `app/login/login-form.tsx`
- Modify: `app/login/page.tsx` (metadata)

**Interfaces:**
- Consumes: `makeLoginFormSchema`, `LoginFormValues`, `loginResponseSchema`, `splitIdentifier` из `src/lib/auth-schemas.ts`; `setAuthCookies` из `src/lib/auth-cookies.ts`; `apiFetch`, `ApiError` из `src/lib/api-server.ts`
- Produces: `POST /api/auth/login` — принимает `LoginFormValues`, ставит cookies, `{ ok: true }` при успехе

- [ ] **Step 1: Удалить старые OTP-роуты**

```bash
rm -rf app/api/auth/otp-request app/api/auth/otp-verify
```

- [ ] **Step 2: Создать `app/api/auth/login/route.ts`**

```ts
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDict } from "@/src/i18n/server"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import { setAuthCookies } from "@/src/lib/auth-cookies"
import {
  loginResponseSchema,
  makeLoginFormSchema,
  splitIdentifier,
} from "@/src/lib/auth-schemas"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ru = await getDict()
  const apiMsgs = {
    unavailable: ru.auth.errors.unavailable,
    checkData: ru.auth.errors.checkData,
  }
  try {
    const body: unknown = await request.json().catch(() => null)
    const parsed = makeLoginFormSchema(ru).safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    const { identifier, password } = parsed.data
    const data = await apiFetch(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          ...splitIdentifier(identifier),
          password,
          device_info: request.headers.get("user-agent"),
        }),
      },
      apiMsgs
    )

    const login = loginResponseSchema.safeParse(data)
    if (!login.success) {
      console.error("[auth/login] unexpected API response:", data)
      return NextResponse.json(
        { message: ru.auth.errors.unexpectedResponse },
        { status: 502 }
      )
    }

    const store = await cookies()
    setAuthCookies(store, {
      token: login.data.access_token,
      expiresAt: login.data.expires_at,
      userId: login.data.user_id,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, errors: error.fieldErrors },
        { status: error.status }
      )
    }
    console.error("[auth/login]", error)
    return NextResponse.json(
      { message: ru.auth.errors.unavailable },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Переписать `app/login/login-form.tsx`**

```tsx
"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { identifier: initialIdentifier, password: "" },
  })

  const identifier = watch("identifier")

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
```

- [ ] **Step 4: Обновить metadata в `app/login/page.tsx`**

В файле `app/login/page.tsx` заменить блок `metadata`:

```tsx
export const metadata: Metadata = {
  title: "ibo — вход",
  description: "Войдите в ibo по номеру телефона или email и паролю.",
}
```

(остальной файл без изменений — `ru.auth.login.title`/`subtitle`/`footer` уже подхватят новые ключи из Task 2)

- [ ] **Step 5: Проверить типы**

```bash
bunx tsc --noEmit
```

Expected: без ошибок в файлах login/otp

- [ ] **Step 6: Commit**

```bash
git add app/api/auth/login app/login/login-form.tsx app/login/page.tsx
git rm -r app/api/auth/otp-request app/api/auth/otp-verify
git commit -m "feat: replace OTP login with password-based single-step login"
```

---

### Task 5: Забыли пароль

**Files:**
- Create: `app/api/auth/forgot-password/route.ts`
- Create: `app/forgot-password/page.tsx`
- Create: `app/forgot-password/forgot-password-form.tsx`

**Interfaces:**
- Consumes: `makeForgotPasswordFormSchema`, `ForgotPasswordFormValues`, `splitIdentifier` из `src/lib/auth-schemas.ts`; `AuthCard` из `src/components/auth/auth-card.tsx`
- Produces: `POST /api/auth/forgot-password`; страница `/forgot-password`

- [ ] **Step 1: Создать `app/api/auth/forgot-password/route.ts`**

```ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDict } from "@/src/i18n/server"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import {
  makeForgotPasswordFormSchema,
  splitIdentifier,
} from "@/src/lib/auth-schemas"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ru = await getDict()
  try {
    const body: unknown = await request.json().catch(() => null)
    const parsed = makeForgotPasswordFormSchema(ru).safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    await apiFetch(
      "/api/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify(splitIdentifier(parsed.data.identifier)),
      },
      {
        unavailable: ru.auth.errors.unavailable,
        checkData: ru.auth.errors.checkData,
      }
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, errors: error.fieldErrors },
        { status: error.status }
      )
    }
    console.error("[auth/forgot-password]", error)
    return NextResponse.json(
      { message: ru.auth.errors.unavailable },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Создать `app/forgot-password/forgot-password-form.tsx`**

```tsx
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
```

- [ ] **Step 3: Создать `app/forgot-password/page.tsx`**

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { AuthCard } from "@/src/components/auth/auth-card"
import { getDict } from "@/src/i18n/server"
import { ForgotPasswordForm } from "./forgot-password-form"

export const metadata: Metadata = {
  title: "ibo — забыли пароль",
  description: "Восстановите доступ к аккаунту ibo.",
}

export default async function ForgotPasswordPage() {
  const ru = await getDict()
  return (
    <AuthCard
      title={ru.auth.forgotPassword.title}
      subtitle={ru.auth.forgotPassword.subtitle}
      footer={
        <Link
          href="/login"
          className="font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
        >
          {ru.auth.forgotPassword.backToLogin}
        </Link>
      }
    >
      <Suspense fallback={null}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthCard>
  )
}
```

- [ ] **Step 4: Проверить типы**

```bash
bunx tsc --noEmit
```

Expected: без ошибок

- [ ] **Step 5: Commit**

```bash
git add app/api/auth/forgot-password app/forgot-password
git commit -m "feat: add forgot-password flow"
```

---

### Task 6: Сброс пароля

**Files:**
- Create: `app/api/auth/reset-password/route.ts`
- Create: `app/reset-password/page.tsx`
- Create: `app/reset-password/reset-password-form.tsx`

**Interfaces:**
- Consumes: `makeResetPasswordFormSchema`, `ResetPasswordFormValues`, `splitIdentifier` из `src/lib/auth-schemas.ts`; `AuthCard`
- Produces: `POST /api/auth/reset-password`; страница `/reset-password`

- [ ] **Step 1: Создать `app/api/auth/reset-password/route.ts`**

```ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDict } from "@/src/i18n/server"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import {
  makeResetPasswordFormSchema,
  splitIdentifier,
} from "@/src/lib/auth-schemas"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ru = await getDict()
  try {
    const body: unknown = await request.json().catch(() => null)
    const parsed = makeResetPasswordFormSchema(ru).safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    const { identifier, reset_code, new_password } = parsed.data
    await apiFetch(
      "/api/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify({
          ...splitIdentifier(identifier),
          reset_code,
          new_password,
        }),
      },
      {
        unavailable: ru.auth.errors.unavailable,
        checkData: ru.auth.errors.checkData,
      }
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, errors: error.fieldErrors },
        { status: error.status }
      )
    }
    console.error("[auth/reset-password]", error)
    return NextResponse.json(
      { message: ru.auth.errors.unavailable },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Создать `app/reset-password/reset-password-form.tsx`**

```tsx
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
```

- [ ] **Step 3: Создать `app/reset-password/page.tsx`**

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { AuthCard } from "@/src/components/auth/auth-card"
import { getDict } from "@/src/i18n/server"
import { ResetPasswordForm } from "./reset-password-form"

export const metadata: Metadata = {
  title: "ibo — новый пароль",
  description: "Задайте новый пароль для аккаунта ibo.",
}

export default async function ResetPasswordPage() {
  const ru = await getDict()
  return (
    <AuthCard
      title={ru.auth.resetPassword.title}
      subtitle={ru.auth.resetPassword.subtitle}
      footer={
        <Link
          href="/login"
          className="font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
        >
          {ru.auth.resetPassword.backToLogin}
        </Link>
      }
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  )
}
```

- [ ] **Step 4: Проверить типы**

```bash
bunx tsc --noEmit
```

Expected: без ошибок

- [ ] **Step 5: Commit**

```bash
git add app/api/auth/reset-password app/reset-password
git commit -m "feat: add reset-password flow"
```

---

### Task 7: Регистрация → best-effort язык, logout/profile/location на новые пути, guard-роуты

**Files:**
- Modify: `app/api/auth/register/route.ts`
- Modify: `app/api/auth/logout/route.ts`
- Modify: `app/api/profile/route.ts`
- Modify: `app/api/profile/location/route.ts`
- Modify: `src/components/layout/profile-menu.tsx`
- Modify: `proxy.ts`

**Interfaces:**
- Consumes: всё из Task 2 (`makeRegisterFormSchema`, `loginResponseSchema`, `makeProfileFormSchema`, `userProfileSchema`, `locationDtoSchema`) + `apiFetch`/`ApiError`/`setAuthCookies`/`clearAuthCookies`/`TOKEN_COOKIE` (без изменений)
- Produces: полностью рабочий сквозной auth-цикл — конечная точка миграции

- [ ] **Step 1: Переписать `app/api/auth/register/route.ts`**

```ts
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDict } from "@/src/i18n/server"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import { setAuthCookies, setLocaleCookie } from "@/src/lib/auth-cookies"
import {
  loginResponseSchema,
  makeRegisterFormSchema,
} from "@/src/lib/auth-schemas"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ru = await getDict()
  const apiMsgs = {
    unavailable: ru.auth.errors.unavailable,
    checkData: ru.auth.errors.checkData,
  }
  try {
    const body: unknown = await request.json().catch(() => null)
    const parsed = makeRegisterFormSchema(ru).safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    const { full_name, phone, email, password, language } = parsed.data
    const data = await apiFetch(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          full_name,
          phone,
          email: email || null,
          password,
          device_info: request.headers.get("user-agent"),
        }),
      },
      apiMsgs
    )

    const login = loginResponseSchema.safeParse(data)
    if (!login.success) {
      console.error("[auth/register] unexpected API response:", data)
      return NextResponse.json(
        { message: ru.auth.errors.unexpectedResponse },
        { status: 502 }
      )
    }

    const store = await cookies()
    setAuthCookies(store, {
      token: login.data.access_token,
      expiresAt: login.data.expires_at,
      userId: login.data.user_id,
    })
    setLocaleCookie(store, language)

    // бэк не принимает language при регистрации — сохраняем отдельным
    // вызовом; ошибка здесь не должна ронять регистрацию
    try {
      await apiFetch(
        "/api/profile",
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${login.data.access_token}` },
          body: JSON.stringify({ language }),
        },
        apiMsgs
      )
    } catch (error) {
      console.error(
        "[auth/register] language patch failed (non-blocking):",
        error
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, errors: error.fieldErrors },
        { status: error.status }
      )
    }
    console.error("[auth/register]", error)
    return NextResponse.json(
      { message: ru.auth.errors.unavailable },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Обновить путь в `app/api/auth/logout/route.ts`**

Заменить:
```ts
      await apiFetch(`/user/logout`, {
```
на:
```ts
      await apiFetch(`/api/auth/logout`, {
```
(остальной файл — без изменений, `Authorization: Bearer` уже передаётся правильно)

- [ ] **Step 3: Обновить пути в `app/api/profile/route.ts`**

В `GET`, заменить:
```ts
    const data = await apiFetch(
      "/user/me",
      { headers: { Authorization: `Bearer ${token}` } },
      apiMsgs
    )
```
на:
```ts
    const data = await apiFetch(
      "/api/profile",
      { headers: { Authorization: `Bearer ${token}` } },
      apiMsgs
    )
```

В `PATCH`, заменить:
```ts
    const { full_name, phone, email, region } = parsed.data
    const data = await apiFetch(
      "/user/me/profile",
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          full_name,
          phone,
          email: email || null,
          region: region || null,
        }),
      },
      apiMsgs
    )
```
на:
```ts
    const { full_name, phone, email } = parsed.data
    const data = await apiFetch(
      "/api/profile",
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          full_name,
          phone,
          email: email || null,
        }),
      },
      apiMsgs
    )
```

- [ ] **Step 4: Обновить путь в `app/api/profile/location/route.ts`**

Заменить:
```ts
    const data = await apiFetch(
      "/user/me/location",
```
на:
```ts
    const data = await apiFetch(
      "/api/profile/location",
```

- [ ] **Step 5: Убрать поле "Регион" из `src/components/layout/profile-menu.tsx`**

Убрать `region` из `toFormValues`:
```ts
function toFormValues(profile: UserProfile): ProfileFormValues {
  return {
    full_name: profile.full_name,
    phone: profile.phone,
    email: profile.email ?? "",
  }
}
```

Убрать блок `<Input id="profile_region" ... />` (идёт сразу после `profile_email` и перед блоком локации `<div className="rounded-2xl border border-edge bg-bg p-4">`):
```tsx
                    <Input
                      id="profile_region"
                      label={dict.auth.register.regionLabel}
                      placeholder={dict.auth.register.regionPlaceholder}
                      error={errors.region?.message}
                      {...register("region")}
                    />
```

- [ ] **Step 6: Добавить forgot/reset-password в guard `proxy.ts`**

```ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"

const GUEST_ONLY_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]

export function proxy(request: NextRequest): NextResponse {
  const hasToken = request.cookies.has(TOKEN_COOKIE)
  const { pathname } = request.nextUrl

  if (!hasToken && pathname === "/chat") {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (hasToken && GUEST_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/chat", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/chat", ...GUEST_ONLY_PATHS],
}
```

- [ ] **Step 7: Проверить типы**

```bash
bunx tsc --noEmit
```

Expected: без ошибок во всём проекте (это должен быть первый полностью чистый прогон с начала миграции)

- [ ] **Step 8: Commit**

```bash
git add app/api/auth/register/route.ts app/api/auth/logout/route.ts app/api/profile/route.ts app/api/profile/location/route.ts src/components/layout/profile-menu.tsx proxy.ts
git commit -m "feat: wire logout/profile/location to new API paths, drop region field"
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

- [ ] **Step 2: Ручная приёмка (см. секцию ниже), затем commit при необходимости фиксов**

Если Step 1/2 выявили правки — исправить, повторить Step 1, закоммитить точечно с понятным сообщением (`fix: ...`).

---

## Ручная приёмка (после Task 8, с живым API `http://167.233.203.129`)

1. `/register`: заполнить имя, телефон, пароль/повтор → «Создать аккаунт» → редирект на `/chat`
2. Профиль (аватар в хедере чата) → «Выйти» → редирект на `/`
3. `/login`: войти тем же телефоном + паролем → `/chat`
4. Выйти, `/login`: войти тем же email (если был указан при регистрации) + паролем → `/chat`
5. `/login` → «Забыли пароль?» → `/forgot-password` → отправить телефон/email → нейтральное сообщение → «Новый пароль» → `/reset-password`
6. `/reset-password`: код из письма/SMS (реальный, полученный от бэка) + новый пароль → `/login`
7. `/login`: войти новым паролем → `/chat`
8. Профиль: открыть форму редактирования — поля "Регион" быть не должно; сохранить имя/телефон/email — обновляется без ошибок
9. Проверить, что зайти на `/login`/`/register`/`/forgot-password`/`/reset-password` с активной cookie-сессией → редирект на `/chat`
10. Корректно на 360px / 768px / 1440px
