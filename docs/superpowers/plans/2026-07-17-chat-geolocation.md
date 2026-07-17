# Chat Geolocation + Warning Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** При первой отправке сообщения запрашивать геолокацию, передавать координаты с каждым сообщением в `/diagnosis/`, при отказе показывать полукрасный warning-баннер вверху чата.

**Architecture:** Клиентский хук `use-chat-geo.ts` владеет геосостоянием (`idle/granted/denied/unavailable`) и выдаёт координаты по запросу; баннер-компонент рендерится в `ChatView` над `MessageList` только при `denied` и отсутствии локации в профиле; прокси-роут `/api/chat/message` валидирует и пробрасывает `latitude`/`longitude` в бэкенд-форму `/diagnosis/`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4 (токен `danger`), motion/react, zod v4, словари `src/i18n/{ru,en,ky}.json`.

**Spec:** `docs/superpowers/specs/2026-07-17-chat-geolocation-design.md`

## Global Constraints

- В проекте нет тест-раннера — верификация каждой задачи: `bunx tsc --noEmit` и `bun run lint` чистые; в финальной задаче ещё `bun run build` + smoke.
- Пакетный менеджер — bun. Никаких новых зависимостей.
- TypeScript strict, никакого `any`; `unknown` только где необходимо. Только `async/await` в новом коде (существующий колбэчный `getCurrentPosition` оборачиваем в Promise).
- Файлы в `kebab-case`.
- Ошибки геолокации НИКОГДА не блокируют и не ломают отправку сообщения.
- `Dictionary = typeof ru` (см. `src/i18n/`) — новые ключи добавляются во все три словаря `ru.json`, `en.json`, `ky.json`, иначе tsc упадёт.
- Коммиты — Conventional Commits, на английском.
- Цветовой токен ошибок — `danger` (`text-danger`, `bg-danger/10`, `border-danger/30`), как в `login-form.tsx:149`.

---

### Task 1: Прокси-роут принимает и пробрасывает координаты

**Files:**
- Modify: `src/lib/chat-schemas.ts`
- Modify: `app/api/chat/message/route.ts`

**Interfaces:**
- Consumes: существующий `POST /api/chat/message` (multipart: `text`, `image`, `chatId`).
- Produces: роут дополнительно принимает опциональные строковые поля формы `latitude` и `longitude`; при валидной паре (числа в ±90/±180) пробрасывает их в `backendForm` для `POST /diagnosis/`; при невалидных/неполных — молча отбрасывает (ответ роута не меняется). Экспорт `chatCoordsSchema` из `src/lib/chat-schemas.ts`.

- [ ] **Step 1: Добавить схему координат в `src/lib/chat-schemas.ts`**

В конец файла:

```ts
const coordField = (min: number, max: number) =>
  z.string().trim().min(1).pipe(z.coerce.number().min(min).max(max))

export const chatCoordsSchema = z.object({
  latitude: coordField(-90, 90),
  longitude: coordField(-180, 180),
})
```

(`z.string()` первым звеном — чтобы `File` из формы и пустая строка не прошли: голый `z.coerce.number()` превратил бы `""` в `0`, а это валидная точка 0,0.)

- [ ] **Step 2: Читать и пробрасывать координаты в `app/api/chat/message/route.ts`**

Импорт: добавить `chatCoordsSchema` в существующий импорт из `@/src/lib/chat-schemas`.

После блока `const parsedChatId = ...` / создания чата, рядом со сборкой `backendForm` (строки ~94-97), заменить:

```ts
    const backendForm = new FormData()
    backendForm.set("chat_id", chatId)
    if (trimmedText) backendForm.set("user_text", trimmedText)
    if (hasImage) backendForm.set("user_image", image)
```

на:

```ts
    const latitudeRaw = form.get("latitude")
    const longitudeRaw = form.get("longitude")
    const coords =
      latitudeRaw !== null && longitudeRaw !== null
        ? chatCoordsSchema.safeParse({
            latitude: latitudeRaw,
            longitude: longitudeRaw,
          })
        : null

    const backendForm = new FormData()
    backendForm.set("chat_id", chatId)
    if (trimmedText) backendForm.set("user_text", trimmedText)
    if (hasImage) backendForm.set("user_image", image)
    if (coords?.success) {
      backendForm.set("latitude", String(coords.data.latitude))
      backendForm.set("longitude", String(coords.data.longitude))
    }
```

- [ ] **Step 3: Верификация**

Run: `bunx tsc --noEmit && bun run lint`
Expected: без ошибок.

- [ ] **Step 4: Smoke роута (координаты не ломают запрос)**

Run: `curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/chat/message -F text=test -F latitude=42.87 -F longitude=74.59` (dev-сервер: `bun run dev`; без токена)
Expected: `401` (unauthorized — координаты распарсились, роут не упал). Остановить dev-сервер после проверки.

- [ ] **Step 5: Commit**

```bash
git add src/lib/chat-schemas.ts app/api/chat/message/route.ts
git commit -m "feat: accept and forward coordinates in chat message route"
```

---

### Task 2: Хук `use-chat-geo`

**Files:**
- Create: `src/components/chat/use-chat-geo.ts`

**Interfaces:**
- Consumes: браузерные `navigator.permissions`, `navigator.geolocation`.
- Produces: `useChatGeo(): { status: GeoStatus; getCoords: () => Promise<GeoCoords | null> }`, где `type GeoStatus = "idle" | "granted" | "denied" | "unavailable"` и `interface GeoCoords { latitude: number; longitude: number }` (оба экспортируются). `getCoords` никогда не reject'ит.

- [ ] **Step 1: Создать `src/components/chat/use-chat-geo.ts`**

```ts
"use client"

import { useEffect, useRef, useState } from "react"

export type GeoStatus = "idle" | "granted" | "denied" | "unavailable"

export interface GeoCoords {
  latitude: number
  longitude: number
}

const GEO_TIMEOUT_MS = 8000
const GEO_MAX_AGE_MS = 5 * 60 * 1000

/**
 * Геосостояние чата: тихо читает разрешение на маунте,
 * координаты запрашивает лениво через getCoords() при отправке сообщения.
 * getCoords никогда не бросает — при отказе/таймауте вернёт null.
 */
export function useChatGeo(): {
  status: GeoStatus
  getCoords: () => Promise<GeoCoords | null>
} {
  const [status, setStatus] = useState<GeoStatus>("idle")
  const statusRef = useRef<GeoStatus>("idle")
  const coordsRef = useRef<GeoCoords | null>(null)
  const inFlightRef = useRef<Promise<GeoCoords | null> | null>(null)

  const applyStatus = (next: GeoStatus) => {
    statusRef.current = next
    setStatus(next)
  }

  useEffect(() => {
    let alive = true
    const check = async () => {
      try {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        })
        if (!alive) return
        if (permission.state === "denied") applyStatus("denied")
        else if (permission.state === "granted") applyStatus("granted")
      } catch {
        // Permissions API нет (старый Safari) — остаёмся в idle,
        // статус узнаем при первом getCoords()
      }
    }
    void check()
    return () => {
      alive = false
    }
  }, [])

  const getCoords = (): Promise<GeoCoords | null> => {
    if (coordsRef.current) return Promise.resolve(coordsRef.current)
    if (statusRef.current === "denied" || statusRef.current === "unavailable") {
      return Promise.resolve(null)
    }
    if (inFlightRef.current) return inFlightRef.current
    if (!("geolocation" in navigator)) {
      applyStatus("unavailable")
      return Promise.resolve(null)
    }

    const request = new Promise<GeoCoords | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: GeoCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          coordsRef.current = coords
          applyStatus("granted")
          resolve(coords)
        },
        (error) => {
          applyStatus(
            error.code === error.PERMISSION_DENIED ? "denied" : "unavailable"
          )
          resolve(null)
        },
        { timeout: GEO_TIMEOUT_MS, maximumAge: GEO_MAX_AGE_MS }
      )
    }).finally(() => {
      inFlightRef.current = null
    })
    inFlightRef.current = request
    return request
  }

  return { status, getCoords }
}
```

- [ ] **Step 2: Верификация**

Run: `bunx tsc --noEmit && bun run lint`
Expected: без ошибок.

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/use-chat-geo.ts
git commit -m "feat: add chat geolocation hook"
```

---

### Task 3: Баннер-предупреждение (иконки + i18n + компонент)

**Files:**
- Modify: `src/components/ui/icons.tsx`
- Modify: `src/i18n/ru.json`, `src/i18n/en.json`, `src/i18n/ky.json`
- Create: `src/components/chat/geo-warning-banner.tsx`

**Interfaces:**
- Consumes: `useI18n` из `@/src/i18n/client` (ключи `dict.chat.geoWarning.text`, `dict.chat.geoWarning.dismissLabel`), `DURATION`/`EASE_OUT` из `@/src/lib/motion-tokens`, паттерн иконок `IconBase` из `icons.tsx`.
- Produces: `GeoWarningBanner` (без пропсов) — сам решает только «закрыт ли в этой сессии»; условие показа (denied + нет локации в профиле) — на вызывающей стороне (Task 4). Экспорты `AlertTriangleIcon`, `XIcon` из `icons.tsx`.

- [ ] **Step 1: Добавить иконки в `src/components/ui/icons.tsx`**

В конец файла, по образцу существующих:

```tsx
export function AlertTriangleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </IconBase>
  )
}

export function XIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </IconBase>
  )
}
```

- [ ] **Step 2: Добавить ключи i18n**

В `src/i18n/ru.json`, внутрь объекта `"chat"` (например, после `"newChat"`):

```json
"geoWarning": {
  "text": "Вы не разрешили доступ к местоположению — диагностика может быть менее точной: без него мы не учитываем погоду вашего района.",
  "dismissLabel": "Скрыть предупреждение"
}
```

В `src/i18n/en.json`, там же:

```json
"geoWarning": {
  "text": "You haven't allowed location access — diagnosis may be less accurate: without it we can't factor in your local weather.",
  "dismissLabel": "Hide warning"
}
```

В `src/i18n/ky.json`, там же (перевод мой, вычитка носителем — отдельно, как ранее):

```json
"geoWarning": {
  "text": "Сиз жайгашкан жерди аныктоого уруксат берген жоксуз — диагностика азыраак так болушу мүмкүн: ансыз аймагыңыздын аба ырайын эске ала албайбыз.",
  "dismissLabel": "Эскертүүнү жашыруу"
}
```

- [ ] **Step 3: Создать `src/components/chat/geo-warning-banner.tsx`**

```tsx
"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/src/i18n/client"
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens"
import { AlertTriangleIcon, XIcon } from "@/src/components/ui/icons"

const DISMISS_KEY = "ibo_geo_banner_dismissed"

function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1"
  } catch {
    return false
  }
}

export function GeoWarningBanner() {
  const { dict } = useI18n()
  const reduceMotion = useReducedMotion()
  const [dismissed, setDismissed] = useState(readDismissed)

  if (dismissed) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // sessionStorage недоступен (privacy-режим) — скрываем только до ремаунта
    }
  }

  return (
    <motion.div
      role="alert"
      initial={reduceMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.fast, ease: EASE_OUT }}
      className="mx-4 mt-3 flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
    >
      <AlertTriangleIcon size={18} className="mt-0.5 flex-none" />
      <p className="flex-1">{dict.chat.geoWarning.text}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label={dict.chat.geoWarning.dismissLabel}
        className="grid size-6 flex-none place-items-center rounded-lg transition-colors hover:bg-danger/10"
      >
        <XIcon size={16} />
      </button>
    </motion.div>
  )
}
```

- [ ] **Step 4: Верификация**

Run: `bunx tsc --noEmit && bun run lint`
Expected: без ошибок (tsc заодно проверит, что ключи добавлены во все три словаря).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/icons.tsx src/i18n/ru.json src/i18n/en.json src/i18n/ky.json src/components/chat/geo-warning-banner.tsx
git commit -m "feat: add geolocation warning banner component"
```

---

### Task 4: Интеграция в чат + финальная верификация

**Files:**
- Modify: `src/components/chat/chat-view.tsx`
- Modify: `src/components/chat/chat-shell.tsx`

**Interfaces:**
- Consumes: `useChatGeo` (Task 2), `GeoWarningBanner` (Task 3), `useProfile` (уже в `chat-shell.tsx`).
- Produces: `ChatView` получает проп `hasProfileLocation: boolean`; координаты уходят с каждым `POST /api/chat/message`.

- [ ] **Step 1: Пробросить `hasProfileLocation` из `chat-shell.tsx`**

В `ChatShell` после `const { profile, setProfile } = useProfile()`:

```tsx
  const hasProfileLocation =
    profile !== null &&
    (profile.location_available ||
      (profile.latitude !== null && profile.longitude !== null))
```

И заменить `<ChatView key={sessionId} />` на:

```tsx
        <ChatView key={sessionId} hasProfileLocation={hasProfileLocation} />
```

- [ ] **Step 2: Интегрировать хук и баннер в `chat-view.tsx`**

Импорты:

```tsx
import { GeoWarningBanner } from "./geo-warning-banner"
import { useChatGeo } from "./use-chat-geo"
```

Сигнатура компонента:

```tsx
interface ChatViewProps {
  hasProfileLocation: boolean
}

export function ChatView({ hasProfileLocation }: ChatViewProps) {
```

Внутри компонента, рядом с остальными хуками:

```tsx
  const { status: geoStatus, getCoords } = useChatGeo()
```

В `send()`, внутри существующего `try`, заменить сборку формы:

```tsx
      const form = new FormData()
      if (chatIdRef.current) form.set("chatId", chatIdRef.current)
      if (trimmed) form.set("text", trimmed)
      if (image) form.set("image", image)
```

на:

```tsx
      const coords = await getCoords()

      const form = new FormData()
      if (chatIdRef.current) form.set("chatId", chatIdRef.current)
      if (trimmed) form.set("text", trimmed)
      if (image) form.set("image", image)
      if (coords) {
        form.set("latitude", String(coords.latitude))
        form.set("longitude", String(coords.longitude))
      }
```

(`getCoords` вызывается после `setPending(true)` — пока пользователь отвечает на браузерный запрос, чат показывает индикатор; таймаут 8 сек гарантирует отправку.)

В JSX — баннер над `MessageList`:

```tsx
    <div className="mx-auto flex min-h-0 w-full max-w-[800px] flex-1 flex-col">
      {geoStatus === "denied" && !hasProfileLocation && <GeoWarningBanner />}
      <MessageList
```

- [ ] **Step 3: Верификация типов и линта**

Run: `bunx tsc --noEmit && bun run lint`
Expected: без ошибок.

- [ ] **Step 4: Полная сборка и smoke**

Run: `bun run build`
Expected: сборка чистая.

Run (после `bun run start` или на dev-сервере; порт чистить через `lsof -tiTCP:3000` при необходимости — `pkill -f "next start"` не убивает `next-server`):

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/          # 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/chat      # 307
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/chat/message -F text=test -F latitude=999 -F longitude=74  # 401 (невалидные координаты не роняют роут)
```

Expected: `200`, `307`, `401`. Остановить сервер.

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/chat-view.tsx src/components/chat/chat-shell.tsx
git commit -m "feat: send geolocation with chat messages and warn on denial"
```

- [ ] **Step 6: Ручная проверка (за пользователем)**

В браузере: разрешить гео → в Network у `POST /api/chat/message` есть `latitude`/`longitude`; отклонить → красный баннер вверху чата, крестик скрывает до конца сессии вкладки; сохранённая локация в профиле → баннера нет даже при отказе.
