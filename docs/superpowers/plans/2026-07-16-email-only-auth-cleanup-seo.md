# Email-only Auth + Cleanup + SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести аутентификацию полностью на email (убрать телефон из логина, регистрации, восстановления пароля и профиля), вычистить мёртвый код и неиспользуемые зависимости, добавить SEO-слой (metadata/OG/sitemap/robots/JSON-LD), затем провести полный e2e-тест на живом бэке.

**Architecture:** Вертикальные слайсы по auth-флоу (login → register → forgot/reset → profile), чтобы `tsc` был зелёным после каждого коммита; словари i18n сначала пополняются новыми ключами, устаревшие удаляются последним auth-коммитом. Чистка — отдельные коммиты на orval-клиент, react-query/zustand и knip-находки. SEO — стандартные Next-конвенции (`generateMetadata`, `app/sitemap.ts`, `app/robots.ts`).

**Tech Stack:** Next.js 16.2.10 (App Router), React 19, TypeScript strict, Tailwind 4, zod 4, react-hook-form, bun. Бэкенд: `http://167.233.203.129` (FastAPI, спека в `openapi.json` — поле `phone` там опционально и остаётся, фронт просто перестаёт его слать).

## Global Constraints

- Спека: `docs/superpowers/specs/2026-07-16-email-only-auth-cleanup-seo-design.md`.
- Ветка: `feat/v4-redesign`. Conventional Commits, только английский.
- Никакого `any`; только `async/await`; файлы в `kebab-case`.
- Проект использует нестандартный Next — перед правкой Next-кода сверяться с `node_modules/next/dist/docs/` (конвенции sitemap/robots проверены: стандартные `MetadataRoute`).
- Верификация каждой задачи: `bunx tsc --noEmit && bun run lint && bun run build` — всё зелёное. Тестового раннера в проекте нет — проверка через tsc/lint/build + curl-smoke (принятый в репо паттерн).
- Словари: `Dictionary = typeof ru.json` — все три локали (`ru`, `en`, `ky`) меняются синхронно, иначе tsc падает.
- Порт 3000 чистить через `lsof -tiTCP:3000 | xargs kill` (процесс называется `next-server`, `pkill -f "next start"` его не находит).
- Почта пользователя для e2e: `bekbolnurmsmitov220099@gmail.com`.

---

### Task 1: Проверить и закоммитить висящий v4-чат

**Files:**
- Commit (уже изменены в рабочей копии): `README.md`, `app/chat/page.tsx`, `src/components/chat/chat-header.tsx`, `src/components/chat/chat-shell.tsx` (новый), `src/components/chat/chat-sidebar.tsx` (новый), `src/components/chat/logout-button.tsx` (удалён)

**Interfaces:**
- Produces: чистое рабочее дерево; `ChatShell` — новая обёртка чата, `logout-button.tsx` больше не существует (логаут живёт в `ProfileMenu`).

- [ ] **Step 1: Верифицировать текущее состояние**

Run: `bunx tsc --noEmit && bun run lint && bun run build`
Expected: без ошибок. Если есть ошибки — починить их ДО коммита (это незавершённая работа прошлой сессии; ошибки чинить минимальными правками в изменённых файлах).

- [ ] **Step 2: Просмотреть diff**

Run: `git diff HEAD && git status --short`
Expected: только перечисленные выше файлы. Убедиться, что `logout-button` нигде не импортируется: `grep -rn "logout-button" app src` → пусто.

- [ ] **Step 3: Commit**

```bash
git add README.md app/chat/page.tsx src/components/chat/
git commit -m "feat: split chat page into chat-shell and chat-sidebar"
```

---

### Task 2: Новые i18n-ключи для email-only auth (все 3 локали)

**Files:**
- Modify: `src/i18n/ru.json`, `src/i18n/en.json`, `src/i18n/ky.json`

**Interfaces:**
- Produces: ключи `auth.login.emailLabel`, `auth.login.emailPlaceholder`, `auth.forgotPassword.emailLabel`, `auth.forgotPassword.emailPlaceholder`, `auth.resetPassword.emailLabel`, `auth.resetPassword.emailPlaceholder`, `auth.errors.emailRequired`; обновлённые тексты `subtitle`/`steps`/`alreadyRegistered`/`resetCodeRequired`. Старые ключи (`identifier*`, `phone*`, `emailHint`, `emailWarning`) пока НЕ трогать — их удалит Task 7.

- [ ] **Step 1: Обновить ru.json**

В `auth.login` заменить значения и добавить ключи (identifier-ключи оставить):

```json
"subtitle": "Введите email и пароль.",
"steps": ["Email", "Пароль"],
"emailLabel": "Email",
"emailPlaceholder": "you@example.com"
```

В `auth.forgotPassword`:

```json
"subtitle": "Укажите email — отправим код для сброса пароля.",
"emailLabel": "Email",
"emailPlaceholder": "you@example.com"
```

В `auth.resetPassword`:

```json
"subtitle": "Введите код из письма и новый пароль.",
"emailLabel": "Email",
"emailPlaceholder": "you@example.com"
```

В `auth.errors` добавить/заменить:

```json
"emailRequired": "Введите email",
"resetCodeRequired": "Введите код из письма"
```

В `auth.register` заменить:

```json
"alreadyRegistered": "Эта почта уже зарегистрирована. Переходим ко входу."
```

- [ ] **Step 2: Обновить en.json** (те же места)

```json
"auth.login": { "subtitle": "Enter your email and password.", "steps": ["Email", "Password"], "emailLabel": "Email", "emailPlaceholder": "you@example.com" }
"auth.forgotPassword": { "subtitle": "Enter your email — we'll send a reset code.", "emailLabel": "Email", "emailPlaceholder": "you@example.com" }
"auth.resetPassword": { "subtitle": "Enter the code from the email and a new password.", "emailLabel": "Email", "emailPlaceholder": "you@example.com" }
"auth.errors": { "emailRequired": "Enter your email", "resetCodeRequired": "Enter the code from the email" }
"auth.register": { "alreadyRegistered": "This email is already registered. Taking you to sign in." }
```

(Записано компактно; в файле — обычные ключи внутри существующих секций.)

- [ ] **Step 3: Обновить ky.json**

```json
"auth.login": { "subtitle": "Email жана сырсөздү киргизиңиз.", "steps": ["Email", "Сырсөз"], "emailLabel": "Email", "emailPlaceholder": "you@example.com" }
"auth.forgotPassword": { "subtitle": "Email көрсөтүңүз — сброс кодун жөнөтөбүз.", "emailLabel": "Email", "emailPlaceholder": "you@example.com" }
"auth.resetPassword": { "subtitle": "Каттагы кодду жана жаңы сырсөздү киргизиңиз.", "emailLabel": "Email", "emailPlaceholder": "you@example.com" }
"auth.errors": { "emailRequired": "Email киргизиңиз", "resetCodeRequired": "Каттагы кодду киргизиңиз" }
"auth.register": { "alreadyRegistered": "Бул email мурунтан катталган. Кирүүгө өтөбүз." }
```

- [ ] **Step 4: Верифицировать и закоммитить**

Run: `python3 -c "import json; [json.load(open(f'src/i18n/{l}.json')) for l in ['ru','en','ky']]" && bunx tsc --noEmit && bun run lint`
Expected: без ошибок (добавление ключей не ломает `Dictionary`).

```bash
git add src/i18n/
git commit -m "feat: add email-only auth i18n keys for ru/en/ky"
```

---

### Task 3: Login-флоу на email

**Files:**
- Modify: `src/lib/auth-schemas.ts`, `app/api/auth/login/route.ts`, `app/login/login-form.tsx`

**Interfaces:**
- Consumes: `auth.errors.emailRequired`, `auth.login.emailLabel/emailPlaceholder` из Task 2.
- Produces: `makeEmailField(e: Dictionary["auth"]["errors"]): z.ZodPipe` — экспорт из `auth-schemas.ts`, переиспользуется в Task 4–6; `LoginFormValues = { email: string; password: string }`; query-параметр `?email=` между /login, /forgot-password, /reset-password.

- [ ] **Step 1: auth-schemas.ts — email-поле и логин-схема**

Добавить экспорт (после импортов, `PHONE_REGEX`/`splitIdentifier` пока не трогать):

```ts
export function makeEmailField(e: Dictionary["auth"]["errors"]) {
  return z.string().trim().min(1, e.emailRequired).pipe(z.email(e.emailFormat))
}
```

Заменить `makeLoginFormSchema`:

```ts
export function makeLoginFormSchema(dict: Dictionary) {
  const e = dict.auth.errors
  return z.object({
    email: makeEmailField(e),
    password: z.string().min(1, e.passwordRequired),
  })
}
```

- [ ] **Step 2: app/api/auth/login/route.ts**

Убрать `splitIdentifier` из импорта. Заменить блок деструктуризации и тело запроса:

```ts
const { email, password } = parsed.data
const data = await apiFetch(
  "/api/auth/login",
  {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      device_info: request.headers.get("user-agent"),
    }),
  },
  apiMsgs
)
```

- [ ] **Step 3: app/login/login-form.tsx**

Точечные замены:

```ts
const STEP_FIELDS: (keyof LoginFormValues)[][] = [["email"], ["password"]]
```

```ts
const initialEmail = searchParams.get("email") ?? ""
```

```ts
defaultValues: { email: initialEmail, password: "" },
```

```ts
const email = useWatch({ control, name: "email" })
```

Поле шага 0:

```tsx
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
```

Ссылка «забыли пароль»:

```tsx
href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
```

- [ ] **Step 4: Верифицировать и закоммитить**

Run: `bunx tsc --noEmit && bun run lint && bun run build`
Expected: зелёное.

```bash
git add src/lib/auth-schemas.ts app/api/auth/login/route.ts app/login/login-form.tsx
git commit -m "feat: switch login to email-only"
```

---

### Task 4: Регистрация на email (email обязателен, телефон удалён)

**Files:**
- Modify: `src/lib/auth-schemas.ts`, `app/api/auth/register/route.ts`, `app/register/register-form.tsx`

**Interfaces:**
- Consumes: `makeEmailField` из Task 3.
- Produces: `RegisterFormValues` без `phone`, `email: string` обязателен.

- [ ] **Step 1: auth-schemas.ts — makeRegisterFormSchema**

```ts
export function makeRegisterFormSchema(dict: Dictionary) {
  const e = dict.auth.errors
  return z
    .object({
      full_name: z.string().trim().min(2, e.nameMin),
      email: makeEmailField(e),
      password: z.string().min(8, e.passwordMin),
      confirm_password: z.string().min(1, e.passwordRequired),
      language: z.enum(["ky", "ru", "en"]),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: e.passwordMismatch,
      path: ["confirm_password"],
    })
}
```

- [ ] **Step 2: app/api/auth/register/route.ts**

```ts
const { full_name, email, password, language } = parsed.data
```

и в теле запроса к бэку (`email` теперь всегда непустой — `|| null` убрать):

```ts
body: JSON.stringify({
  full_name,
  email,
  password,
  device_info: request.headers.get("user-agent"),
}),
```

- [ ] **Step 3: app/register/register-form.tsx**

```ts
const STEP_FIELDS: (keyof RegisterFormValues)[][] = [
  ["full_name", "email"],
  ["password", "confirm_password"],
  ["language"],
]
```

`defaultValues` без `phone`. Удалить `const emailValue = useWatch(...)` (нужен был только для warning; `useWatch` из импорта react-hook-form тоже убрать, если больше не используется). Шаг 0 — убрать телефонный `Input` целиком, email-поле без `hint`/`warning`:

```tsx
<Input
  id="email"
  type="email"
  label={ru.auth.register.emailLabel}
  placeholder={ru.auth.register.emailPlaceholder}
  autoComplete="email"
  error={errors.email?.message}
  {...register("email")}
/>
```

Редирект 409:

```ts
router.push(`/login?email=${encodeURIComponent(values.email)}`)
```

- [ ] **Step 4: Верифицировать и закоммитить**

Run: `bunx tsc --noEmit && bun run lint && bun run build`

```bash
git add src/lib/auth-schemas.ts app/api/auth/register/route.ts app/register/register-form.tsx
git commit -m "feat: switch registration to email-only"
```

---

### Task 5: Forgot/Reset password на email

**Files:**
- Modify: `src/lib/auth-schemas.ts`, `app/api/auth/forgot-password/route.ts`, `app/api/auth/reset-password/route.ts`, `app/forgot-password/forgot-password-form.tsx`, `app/reset-password/reset-password-form.tsx`

**Interfaces:**
- Consumes: `makeEmailField`; query-параметр `?email=` из Task 3.
- Produces: `ForgotPasswordFormValues = { email: string }`; `ResetPasswordFormValues = { email; reset_code; new_password; confirm_password }`.

- [ ] **Step 1: auth-schemas.ts — обе схемы**

```ts
export function makeForgotPasswordFormSchema(dict: Dictionary) {
  return z.object({ email: makeEmailField(dict.auth.errors) })
}
```

```ts
export function makeResetPasswordFormSchema(dict: Dictionary) {
  const e = dict.auth.errors
  return z
    .object({
      email: makeEmailField(e),
      reset_code: z.string().trim().min(1, e.resetCodeRequired),
      new_password: z.string().min(8, e.passwordMin),
      confirm_password: z.string().min(1, e.passwordRequired),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: e.passwordMismatch,
      path: ["confirm_password"],
    })
}
```

- [ ] **Step 2: Роуты**

`forgot-password/route.ts`: убрать `splitIdentifier` из импорта, тело:

```ts
body: JSON.stringify({ email: parsed.data.email }),
```

`reset-password/route.ts`: убрать `splitIdentifier`, деструктуризация и тело:

```ts
const { email, reset_code, new_password } = parsed.data
```

```ts
body: JSON.stringify({ email, reset_code, new_password }),
```

- [ ] **Step 3: forgot-password-form.tsx**

`initialIdentifier` → `const initialEmail = searchParams.get("email") ?? ""`; `defaultValues: { email: initialEmail }`; в sent-ветке `const email = getValues("email")` и `router.push(\`/reset-password?email=${encodeURIComponent(email)}\`)`; поле:

```tsx
<Input
  id="email"
  type="email"
  label={ru.auth.forgotPassword.emailLabel}
  placeholder={ru.auth.forgotPassword.emailPlaceholder}
  autoComplete="email"
  error={errors.email?.message}
  {...register("email")}
/>
```

- [ ] **Step 4: reset-password-form.tsx**

Аналогично: `searchParams.get("email")`, `defaultValues: { email: initialEmail, ... }`, поле:

```tsx
<Input
  id="email"
  type="email"
  label={ru.auth.resetPassword.emailLabel}
  placeholder={ru.auth.resetPassword.emailPlaceholder}
  autoComplete="email"
  error={errors.email?.message}
  {...register("email")}
/>
```

- [ ] **Step 5: Верифицировать и закоммитить**

Run: `bunx tsc --noEmit && bun run lint && bun run build`

```bash
git add src/lib/auth-schemas.ts app/api/auth/forgot-password/route.ts app/api/auth/reset-password/route.ts app/forgot-password/forgot-password-form.tsx app/reset-password/reset-password-form.tsx
git commit -m "feat: switch password recovery to email-only"
```

---

### Task 6: Профиль без телефона

**Files:**
- Modify: `src/lib/profile-schemas.ts`, `app/api/profile/route.ts`, `src/components/layout/profile-menu.tsx`

**Interfaces:**
- Consumes: `makeEmailField` из `@/src/lib/auth-schemas`.
- Produces: `UserProfile` без `phone`; `ProfileFormValues = { full_name: string; email: string }` (email обязателен — иначе юзер запрёт себе вход).

- [ ] **Step 1: profile-schemas.ts**

Удалить локальный `PHONE_REGEX`, импортировать `makeEmailField`:

```ts
import { z } from "zod"
import type { Dictionary } from "@/src/i18n/dictionaries"
import { makeEmailField } from "@/src/lib/auth-schemas"

export const userProfileSchema = z.object({
  id: z.string(),
  full_name: z.string(),
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
    email: makeEmailField(e),
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

- [ ] **Step 2: app/api/profile/route.ts (PATCH)**

```ts
const { full_name, email } = parsed.data
const data = await apiFetch(
  "/api/profile",
  {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ full_name, email }),
  },
  apiMsgs
)
```

- [ ] **Step 3: profile-menu.tsx**

`toFormValues`:

```ts
function toFormValues(profile: UserProfile): ProfileFormValues {
  return {
    full_name: profile.full_name,
    email: profile.email ?? "",
  }
}
```

В row-варианте подсказка под именем:

```tsx
<small className="block truncate text-[12px] text-header-fg-muted">
  {profile.email || p.menuHint}
</small>
```

В форме шторки: удалить `Input id="profile_phone"` целиком; у `Input id="profile_email"` убрать проп `hint`.

- [ ] **Step 4: Верифицировать и закоммитить**

Run: `bunx tsc --noEmit && bun run lint && bun run build`

```bash
git add src/lib/profile-schemas.ts app/api/profile/route.ts src/components/layout/profile-menu.tsx
git commit -m "feat: remove phone from profile"
```

---

### Task 7: Удалить телефонные хелперы и устаревшие i18n-ключи

**Files:**
- Modify: `src/lib/auth-schemas.ts`, `src/i18n/ru.json`, `src/i18n/en.json`, `src/i18n/ky.json`

**Interfaces:**
- Consumes: Tasks 3–6 завершены (никто больше не использует identifier/phone).
- Produces: `auth-schemas.ts` без `PHONE_REGEX`/`isPhoneLike`/`splitIdentifier`; словари без мёртвых ключей.

- [ ] **Step 1: Убедиться, что ссылок не осталось**

Run: `grep -rn "splitIdentifier\|isPhoneLike\|identifierLabel\|identifierPlaceholder\|identifierRequired\|phoneLabel\|phonePlaceholder\|phoneFormat\|emailHint\|emailWarning" app src --include="*.ts" --include="*.tsx" | grep -v "src/i18n/"`
Expected: только определения в `auth-schemas.ts` (и ничего в формах/роутах). Если есть другие ссылки — сперва зачистить их.

- [ ] **Step 2: auth-schemas.ts**

Удалить строки:

```ts
const PHONE_REGEX = /^\+?\d{9,15}$/

export function isPhoneLike(value: string): boolean { ... }

export function splitIdentifier(value: string): { phone?: string; email?: string } { ... }
```

- [ ] **Step 3: Словари (все 3 локали)**

Удалить ключи: `auth.login.identifierLabel`, `auth.login.identifierPlaceholder`, `auth.forgotPassword.identifierLabel`, `auth.forgotPassword.identifierPlaceholder`, `auth.resetPassword.identifierLabel`, `auth.resetPassword.identifierPlaceholder`, `auth.register.phoneLabel`, `auth.register.phonePlaceholder`, `auth.register.emailHint`, `auth.register.emailWarning`, `auth.errors.identifierRequired`, `auth.errors.phoneFormat`.

- [ ] **Step 4: Верифицировать и закоммитить**

Run: `python3 -c "import json; [json.load(open(f'src/i18n/{l}.json')) for l in ['ru','en','ky']]" && bunx tsc --noEmit && bun run lint && bun run build`

```bash
git add src/lib/auth-schemas.ts src/i18n/
git commit -m "refactor: drop phone identifier helpers and stale i18n keys"
```

---

### Task 8: Удалить orval-клиент и его зависимости

**Files:**
- Delete: `src/api/` (весь каталог), `orval.config.ts`
- Modify: `package.json`, `.env`, `.env.example` (все файлы из `ls .env*`)

**Interfaces:**
- Produces: в проекте нет `axios`, `orval`, `ajv`, `NEXT_PUBLIC_API_URL`; серверный код ходит в бэк только через `src/lib/api-server.ts` (env `API_URL`).

- [ ] **Step 1: Подтвердить неиспользуемость**

Run: `grep -rln "src/api\|api/generated" app src proxy.ts next.config.ts | grep -v "^src/api"` → пусто.
Run: `grep -rln "axios" app src proxy.ts next.config.ts | grep -v "^src/api"` → пусто.
Run: `grep -rn "ajv" app src proxy.ts next.config.ts eslint.config.mjs` → пусто.

- [ ] **Step 2: Удалить файлы**

```bash
rm -rf src/api orval.config.ts
```

- [ ] **Step 3: package.json**

Удалить из `scripts`: `"generate-api": "orval"`. Удалить из `dependencies`: `"axios"`. Удалить из `devDependencies`: `"orval"`, `"ajv"`.

- [ ] **Step 4: env-файлы**

Из каждого файла `ls .env*` удалить строку `NEXT_PUBLIC_API_URL=...` (строку `API_URL=` оставить — она используется `api-server.ts`).

- [ ] **Step 5: Переустановить и верифицировать**

Run: `bun install && bunx tsc --noEmit && bun run lint && bun run build`
Expected: зелёное, `bun.lock` обновился.

```bash
git add -A
git commit -m "chore: remove unused orval api client and its deps"
```

---

### Task 9: Удалить react-query и zustand (не используются)

**Files:**
- Modify: `app/providers.tsx`, `package.json`

**Interfaces:**
- Produces: `Providers` рендерит только `children` + `Toaster`; в deps нет `@tanstack/*` и `zustand`.

- [ ] **Step 1: Подтвердить неиспользуемость**

Run: `grep -rn "useQuery\|useMutation\|useQueryClient\|@tanstack" app src | grep -v "app/providers.tsx"` → пусто (Task 8 уже удалил `src/api/generated`).
Run: `grep -rln "zustand" app src` → пусто.

- [ ] **Step 2: providers.tsx — полное новое содержимое**

```tsx
"use client"

import type { ReactNode } from "react"
import { Toaster } from "react-hot-toast"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  )
}
```

- [ ] **Step 3: package.json**

Удалить из `dependencies`: `"@tanstack/react-query"`, `"@tanstack/react-query-devtools"`, `"zustand"`.

- [ ] **Step 4: Переустановить и верифицировать**

Run: `bun install && bunx tsc --noEmit && bun run lint && bun run build`

```bash
git add app/providers.tsx package.json bun.lock
git commit -m "chore: drop unused react-query provider and zustand"
```

---

### Task 10: Knip-скан и добор мёртвого кода

**Files:**
- Modify: по находкам (каждая — только после ручной верификации)

**Interfaces:**
- Consumes: Tasks 8–9 (крупный известный мусор уже удалён — меньше шума).
- Produces: проект без неиспользуемых файлов/экспортов/зависимостей/i18n-ключей/ассетов.

- [ ] **Step 1: Прогнать knip**

Run: `bunx knip --no-progress`
Expected: список unused files / exports / dependencies. Next-конвенции (`page.tsx`, `layout.tsx`, `route.ts`, `sitemap.ts`, `robots.ts`, `proxy.ts`) — ложные срабатывания, НЕ удалять.

- [ ] **Step 2: Верифицировать каждую находку вручную**

Для каждого кандидата: `grep -rn "<имя>" app src proxy.ts next.config.ts` — удалять только при нуле ссылок. Динамики (строковые пути, шаблоны) в проекте нет, но проверить `String(...)`-конкатенации глазами.

- [ ] **Step 3: Скан неиспользуемых i18n-ключей**

```bash
python3 - <<'EOF'
import json, re, subprocess

def flatten(d, prefix=""):
    for k, v in d.items():
        path = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            yield from flatten(v, path)
        else:
            yield path

keys = set(flatten(json.load(open("src/i18n/ru.json"))))
src = subprocess.run(
    ["grep", "-rhoE", r"\.[a-zA-Z][a-zA-Z0-9]*", "app", "src", "--include=*.tsx", "--include=*.ts"],
    capture_output=True, text=True
).stdout
used_segments = set(m[1:] for m in re.findall(r"\.[a-zA-Z][a-zA-Z0-9]*", src))
for key in sorted(keys):
    last = key.split(".")[-1]
    if last not in used_segments:
        print("UNUSED?", key)
EOF
```

Каждый `UNUSED?` проверить грепом по последнему сегменту; подтверждённые удалить из всех 3 локалей.

- [ ] **Step 4: Неиспользуемые ассеты public/**

Run: `for f in $(ls public); do grep -rq "$f" app src || echo "UNUSED? public/$f"; done`
Подтверждённые удалить (favicon.ico живёт в `app/` — не трогать).

- [ ] **Step 5: Верифицировать и закоммитить**

Run: `bunx tsc --noEmit && bun run lint && bun run build`

```bash
git add -A
git commit -m "chore: remove dead code, unused i18n keys and assets"
```

(Если находок нет — коммит пропустить, зафиксировать в отчёте «knip чисто».)

---

### Task 11: Аудит дыр + README-заметка об http://

**Files:**
- Read: все `app/api/*/route.ts`
- Modify: `README.md`

**Interfaces:**
- Produces: подтверждённый чек-лист безопасности в отчёте; README с разделом «Известные ограничения».

- [ ] **Step 1: Чек-лист по каждому route.ts**

Прочитать `app/api/auth/{login,register,logout,forgot-password,reset-password}/route.ts`, `app/api/profile/route.ts`, `app/api/profile/location/route.ts`, `app/api/chat/message/route.ts`, `app/api/locale/route.ts` и проверить: (1) body парсится zod-схемой ДО `apiFetch`; (2) ошибки не пробрасывают сырой текст бэка без статуса; (3) токен берётся только из httpOnly-куки; (4) 401 чистит куки (`clearAuthCookies`). Любое отклонение — починить в этом же таске мини-правкой.

- [ ] **Step 2: Секреты в клиентском бандле**

Run: `grep -rn "NEXT_PUBLIC_" app src next.config.ts` — допустим только `NEXT_PUBLIC_SITE_URL` (появится в Task 12; на этом шаге допустимо пусто). `API_URL` не должен встречаться в `"use client"`-файлах: `grep -rln "process.env.API_URL" src/components app | xargs -I{} grep -l "use client" {}` → пусто.

- [ ] **Step 3: README**

Добавить в конец README раздел:

```markdown
## Известные ограничения

- Бэкенд доступен по `http://` (голый IP, без TLS): трафик между Next-сервером и API не шифруется. Чинится доменом и сертификатом на стороне бэкенда; фронт при этом менять не нужно (только `API_URL`).
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add known-limitations section on plain-http backend"
```

(+ отдельные fix-коммиты, если шаг 1 нашёл отклонения.)

---

### Task 12: metadataBase + Open Graph в layout

**Files:**
- Modify: `app/layout.tsx`, `.env`, `.env.example`

**Interfaces:**
- Produces: env `NEXT_PUBLIC_SITE_URL` (плейсхолдер `http://localhost:3000` — домена пока нет); все страницы наследуют OG-теги; `metadataBase` для резолва относительных URL в sitemap/OG.

- [ ] **Step 1: env-файлы**

В каждый файл из `ls .env*` добавить строку:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 2: app/layout.tsx — generateMetadata**

Заменить существующий `generateMetadata`:

```tsx
const OG_LOCALES: Record<string, string> = {
  ru: "ru_RU",
  ky: "ky_KG",
  en: "en_US",
};

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  const locale = await getLocale();
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    ),
    title: dict.meta.title,
    description: dict.meta.description,
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      siteName: "ibo",
      type: "website",
      locale: OG_LOCALES[locale] ?? "ru_RU",
    },
  };
}
```

- [ ] **Step 3: Верифицировать и закоммитить**

Run: `bunx tsc --noEmit && bun run lint && bun run build`, затем `bun run start` не нужен — проверка OG в Task 16.

```bash
git add app/layout.tsx .env.example
git commit -m "feat: add metadataBase and Open Graph metadata"
```

(`.env` в git не коммитится — он в .gitignore; менять локально.)

---

### Task 13: Локализованные metadata auth-страниц + noindex

**Files:**
- Modify: `src/i18n/ru.json`, `src/i18n/en.json`, `src/i18n/ky.json`, `app/login/page.tsx`, `app/register/page.tsx`, `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`, `app/chat/page.tsx`

**Interfaces:**
- Consumes: `getDict` из `@/src/i18n/server` (паттерн — `app/about/page.tsx`).
- Produces: ключи `meta.login`, `meta.register`, `meta.forgotPassword`, `meta.resetPassword`, `meta.chat` (`{title, description}`); auth/chat-страницы с `robots: { index: false }`.

- [ ] **Step 1: Добавить meta-ключи в словари**

ru.json, секция `meta` (дополнить):

```json
"login": { "title": "ibo — вход", "description": "Войдите в ibo по email и паролю." },
"register": { "title": "ibo — регистрация", "description": "Создайте аккаунт ibo — AI-агроном в вашем кармане." },
"forgotPassword": { "title": "ibo — забыли пароль", "description": "Восстановите доступ к аккаунту ibo." },
"resetPassword": { "title": "ibo — новый пароль", "description": "Задайте новый пароль для аккаунта ibo." },
"chat": { "title": "ibo — чат", "description": "Чат с AI-агрономом ibo." }
```

en.json:

```json
"login": { "title": "ibo — sign in", "description": "Sign in to ibo with your email and password." },
"register": { "title": "ibo — sign up", "description": "Create an ibo account — an AI agronomist in your pocket." },
"forgotPassword": { "title": "ibo — forgot password", "description": "Regain access to your ibo account." },
"resetPassword": { "title": "ibo — new password", "description": "Set a new password for your ibo account." },
"chat": { "title": "ibo — chat", "description": "Chat with the ibo AI agronomist." }
```

ky.json:

```json
"login": { "title": "ibo — кирүү", "description": "ibo'го email жана сырсөз менен кириңиз." },
"register": { "title": "ibo — каттоо", "description": "ibo аккаунтун түзүңүз — чөнтөгүңүздөгү AI-агроном." },
"forgotPassword": { "title": "ibo — сырсөздү унуттуңуз", "description": "ibo аккаунтуна кирүүнү калыбына келтириңиз." },
"resetPassword": { "title": "ibo — жаңы сырсөз", "description": "ibo аккаунту үчүн жаңы сырсөз коюңуз." },
"chat": { "title": "ibo — чат", "description": "ibo AI-агроному менен чат." }
```

- [ ] **Step 2: Заменить статический metadata на generateMetadata**

В каждой из 4 auth-страниц заменить `export const metadata: Metadata = {...}` на (пример для login; для остальных — свой ключ `dict.meta.register` / `dict.meta.forgotPassword` / `dict.meta.resetPassword`):

```tsx
export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict()
  return {
    title: dict.meta.login.title,
    description: dict.meta.login.description,
    robots: { index: false },
  }
}
```

(`getDict` уже импортирован на login/register-страницах; на forgot/reset — добавить импорт `import { getDict } from "@/src/i18n/server"`.)

`app/chat/page.tsx` — то же с `dict.meta.chat` (добавить импорт `getDict`).

- [ ] **Step 3: Верифицировать и закоммитить**

Run: `bunx tsc --noEmit && bun run lint && bun run build`

```bash
git add src/i18n/ app/login/page.tsx app/register/page.tsx app/forgot-password/page.tsx app/reset-password/page.tsx app/chat/page.tsx
git commit -m "feat: localize auth and chat page metadata with noindex"
```

---

### Task 14: sitemap.ts + robots.ts

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SITE_URL` из Task 12.
- Produces: `/sitemap.xml` (/, /about), `/robots.txt` (disallow приватных путей).

- [ ] **Step 1: app/sitemap.ts**

```ts
import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ]
}
```

- [ ] **Step 2: app/robots.ts**

```ts
import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/chat",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
```

- [ ] **Step 3: Верифицировать и закоммитить**

Run: `bunx tsc --noEmit && bun run lint && bun run build`
Expected: в выводе build появились роуты `/sitemap.xml` и `/robots.txt`.

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat: add sitemap and robots"
```

---

### Task 15: JSON-LD на лендинге

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SITE_URL`; `getDict` для описания.
- Produces: `<script type="application/ld+json">` c Organization + WebSite.

- [ ] **Step 1: app/page.tsx**

Страница — server component. Добавить импорт `getDict` (если его нет) и перед `<Header />` вставить скрипт. Сделать компонент `async`, если ещё не:

```tsx
import { getDict } from "@/src/i18n/server"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export default async function Home() {
  const dict = await getDict()
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "ibo",
        url: SITE_URL,
        description: dict.meta.description,
      },
      {
        "@type": "WebSite",
        name: "ibo",
        url: SITE_URL,
        inLanguage: ["ky", "ru", "en"],
      },
    ],
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ...существующий JSX страницы без изменений... */}
    </>
  )
}
```

(Существующую разметку страницы сохранить как есть; добавляется только script и обёртка-фрагмент, если её нет.)

- [ ] **Step 2: Верифицировать и закоммитить**

Run: `bunx tsc --noEmit && bun run lint && bun run build`

```bash
git add app/page.tsx
git commit -m "feat: add JSON-LD structured data to landing"
```

---

### Task 16: Полная верификация и e2e на живом бэке

**Files:**
- Никаких правок кода (кроме fix-коммитов по найденным багам)

**Interfaces:**
- Consumes: всё выше; почта пользователя `bekbolnurmsmitov220099@gmail.com`; живой бэк `http://167.233.203.129` через локальный прод-сервер.
- Produces: отчёт о прохождении; шаг 8 требует код из письма от пользователя.

- [ ] **Step 1: Собрать и поднять прод-сервер**

```bash
lsof -tiTCP:3000 | xargs kill 2>/dev/null
bun run build && bun run start &
sleep 3
```

- [ ] **Step 2: Smoke всех страниц по локалям**

```bash
for l in ru ky en; do for p in / /about /login /register /forgot-password /reset-password; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -b "ibo_locale=$l" "http://localhost:3000$p"); echo "$l $p -> $code"
done; done
curl -s -o /dev/null -w "/chat -> %{http_code}\n" "http://localhost:3000/chat"
curl -s -o /dev/null -w "/sitemap.xml -> %{http_code}\n" "http://localhost:3000/sitemap.xml"
curl -s -o /dev/null -w "/robots.txt -> %{http_code}\n" "http://localhost:3000/robots.txt"
```

Expected: страницы 200, `/chat` 307. Телефона нет: `curl -s -b "ibo_locale=ru" http://localhost:3000/login | grep -ci "телефон"` → 0 (то же для /register, /forgot-password, /reset-password).

- [ ] **Step 3: Негативные кейсы register/login**

```bash
curl -s -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"full_name":"T","email":"not-an-email","password":"12345678","confirm_password":"12345678","language":"ru"}' -w "\n%{http_code}\n"
curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"nosuchuser@example.com","password":"wrongpass123"}' -w "\n%{http_code}\n"
```

Expected: 400 с сообщением; логин — 4xx с понятным message (не 500).

- [ ] **Step 4: Регистрация реального аккаунта**

Сгенерировать пароль `PW=$(openssl rand -base64 12)`, вывести его пользователю в отчёте.

```bash
curl -s -c /tmp/ibo-jar -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" \
  -d "{\"full_name\":\"Bekbol\",\"email\":\"bekbolnurmsmitov220099@gmail.com\",\"password\":\"$PW\",\"confirm_password\":\"$PW\",\"language\":\"ru\"}" -w "\n%{http_code}\n"
```

Expected: 200 `{"ok":true}` + куки в jar. Если 409 (почта уже есть) — перейти сразу к шагу 8 (сброс пароля) и вернуться к логину.

- [ ] **Step 5: Профиль и чат под токеном**

```bash
curl -s -b /tmp/ibo-jar http://localhost:3000/api/profile          # профиль, без поля phone
curl -s -b /tmp/ibo-jar -X POST http://localhost:3000/api/chat/message -F "text=Помидор желтеют листья, что делать?"   # ответ AI (может занять десятки секунд)
curl -s -b /tmp/ibo-jar -X PATCH http://localhost:3000/api/profile -H "Content-Type: application/json" -d '{"full_name":"Bekbol N","email":"bekbolnurmsmitov220099@gmail.com"}' -w "\n%{http_code}\n"
```

Expected: профиль 200 без `phone`; чат вернул `answer`; PATCH 200 c обновлённым именем.

- [ ] **Step 6: Logout и повторный логин**

```bash
curl -s -b /tmp/ibo-jar -c /tmp/ibo-jar -X POST http://localhost:3000/api/auth/logout -w "\n%{http_code}\n"
curl -s -c /tmp/ibo-jar -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"bekbolnurmsmitov220099@gmail.com\",\"password\":\"$PW\"}" -w "\n%{http_code}\n"
```

Expected: logout 200, куки очищены; логин 200 `{"ok":true}`.

- [ ] **Step 7: Неверный пароль на существующем аккаунте**

```bash
curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"bekbolnurmsmitov220099@gmail.com","password":"definitely-wrong-1"}' -w "\n%{http_code}\n"
```

Expected: 4xx с понятным message.

- [ ] **Step 8: Forgot/reset (интерактив с пользователем)**

```bash
curl -s -X POST http://localhost:3000/api/auth/forgot-password -H "Content-Type: application/json" -d '{"email":"bekbolnurmsmitov220099@gmail.com"}' -w "\n%{http_code}\n"
```

Expected: 200. **ОСТАНОВИТЬСЯ и спросить у пользователя код из письма.** Затем (`NEW_PW` — новый сгенерированный пароль, показать пользователю):

```bash
curl -s -X POST http://localhost:3000/api/auth/reset-password -H "Content-Type: application/json" -d "{\"email\":\"bekbolnurmsmitov220099@gmail.com\",\"reset_code\":\"<КОД>\",\"new_password\":\"$NEW_PW\",\"confirm_password\":\"$NEW_PW\"}" -w "\n%{http_code}\n"
curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"bekbolnurmsmitov220099@gmail.com\",\"password\":\"$NEW_PW\"}" -w "\n%{http_code}\n"
```

Expected: reset 200, логин с новым паролем 200.

- [ ] **Step 9: SEO-проверки**

```bash
curl -s http://localhost:3000/robots.txt
curl -s http://localhost:3000/sitemap.xml
curl -s -b "ibo_locale=ru" http://localhost:3000/ | grep -o '<script type="application/ld+json">[^<]*' | head -c 300
curl -s -b "ibo_locale=ru" http://localhost:3000/login | grep -io '<meta name="robots"[^>]*>'
curl -s -b "ibo_locale=en" http://localhost:3000/ | grep -io '<meta property="og:title"[^>]*>'
```

Expected: robots с disallow-списком и sitemap-ссылкой; sitemap с / и /about; JSON-LD присутствует; на /login есть noindex; OG-теги на месте и локализованы.

- [ ] **Step 10: Остановить сервер и отчитаться**

```bash
lsof -tiTCP:3000 | xargs kill 2>/dev/null
```

Отчёт пользователю: результат каждого шага, оба пароля (из шага 4 и 8 — рекомендовать сменить), найденные и починенные баги (каждый багфикс — отдельный `fix:`-коммит).

---

## Self-Review

- Спека покрыта: блок 0 → Task 1; auth email-only (формы/схемы/роуты/профиль/i18n) → Tasks 2–7; чистка (orval, knip, аудит, README) → Tasks 8–11; SEO (metadata, noindex, sitemap/robots, JSON-LD, NEXT_PUBLIC_SITE_URL) → Tasks 12–15; тестирование → Task 16.
- Типы согласованы: `makeEmailField` определён в Task 3, используется в Tasks 4–6; `?email=` query-параметр согласован между Tasks 3 и 5; `dict.meta.*` ключи Task 13 совпадают с использованием в generateMetadata.
- Плейсхолдеров нет; каждый код-шаг содержит конечный код.
