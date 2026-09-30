# Chat History Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a ChatGPT-style chat history sidebar (list, open, rename, delete/restore) to the ibo chat app, backed by the already-live `/chat/*` backend endpoints.

**Architecture:** Four thin Next.js route handlers proxy the backend `/chat/*` endpoints (cookie token → zod-validated input → `apiFetch` with Bearer → zod-validated output). A pure reducer (`chat-history-state.ts`) owns all list/rename/delete/restore/rollback logic and is unit-tested in isolation; a thin hook (`use-chat-history.ts`) wraps it with `fetch` calls to the new routes. `ChatShell` gains an `activeChatId` and a `/chat/[chatId]` dynamic route so an open chat survives a reload.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4, zod, `motion/react`, `react-hot-toast`, Phosphor icons, `bun test`.

**Spec:** `docs/superpowers/specs/2026-09-29-chat-history-design.md`

## Global Constraints

- No `any`; use `unknown` only where the shape is genuinely unknown (e.g. parsed JSON before validation).
- Every new route handler validates both its input (zod) and the backend's response (zod) before returning JSON to the client — no unchecked pass-through.
- Route handlers follow the existing pattern exactly: read `TOKEN_COOKIE` → 401 if missing → `apiFetch(..., { headers: { Authorization: \`Bearer ${token}\` } }, apiMsgs)` → `handleApiError` on catch.
- New i18n strings are added to `ru.json`, `en.json`, and `ky.json` in the same commit — never to one file alone.
- Motion uses only the existing tokens in `src/lib/motion-tokens.ts` (`DURATION`, `EASE_OUT`, `SPRING_SNAPPY`, `REVEAL_OFFSET`) — no new duration/easing/spring constants.
- No new state-management dependency (no Zustand, no React Query) — the reducer-plus-hook pattern already used by `sidebar-state.ts`/`chat-shell.tsx` is the only pattern for this feature.
- MVP scope: the chat list itself (`GET /chat/`) is fetched once with `limit=50` and never paginated further (spec decision #3) — do not add `offset` handling.
- Git commits: Conventional Commits, English messages only (`feat: ...`, `fix: ...`, `docs: ...`, `test: ...`).

## Review Focus

- Renaming a chat to an empty/whitespace-only title must not fire a network request or silently produce an empty title — covered by Task 7 (`commitRename` guard) and Task 1 (`chatRenameFormSchema` rejects empty string).
- Deleting or losing access to the **currently open** chat must navigate the user away from it, not leave a dead `/chat/[chatId]` on screen — covered by Task 7's `shouldRedirectAfterRemoval` and Task 13's wiring.
- Restoring a chat past its `RETENTION_DAYS` window (backend returns 404) must remove it from the trash view for good, never roll it back in and retry forever — covered by Task 7's `shouldRollbackAfterFailure`.
- A malformed or missing `messages`/`has_more` shape from `/api/chat/[chatId]/messages` must show an error and return to `/chat`, not crash the chat page — covered by Task 8 (`parseHistoryResponse`).
- Opening `/chat/[chatId]` with a syntactically invalid id must 404 instead of forwarding garbage to the backend — covered by Task 1 (`chatIdSchema` unit test) and Task 14 (page-level guard).

---

### Task 1: Chat schemas

**Files:**
- Modify: `src/lib/chat-schemas.ts`
- Test: `src/lib/chat-schemas.test.ts` (new)

**Interfaces:**
- Consumes: nothing new (existing `chatIdSchema` already in the file).
- Produces: `chatListItemSchema`, `chatMessageSchema`, `chatMessagesResponseSchema`, `chatRenameFormSchema` — all `zod` schemas, imported by Task 2's route handlers and by `chat-history-mapping.ts` (Task 8).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/chat-schemas.test.ts`:

```ts
import { describe, expect, test } from "bun:test"
import {
  chatIdSchema,
  chatListItemSchema,
  chatMessageSchema,
  chatMessagesResponseSchema,
  chatRenameFormSchema,
} from "./chat-schemas"

describe("chatIdSchema", () => {
  test("accepts a valid uuid", () => {
    expect(chatIdSchema.safeParse("3fa85f64-5717-4562-b3fc-2c963f66afa6").success).toBe(true)
  })

  test("rejects a non-uuid string", () => {
    expect(chatIdSchema.safeParse("not-a-uuid").success).toBe(false)
  })
})

describe("chatListItemSchema", () => {
  test("accepts a chat with a null title and purge_at", () => {
    const result = chatListItemSchema.safeParse({
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      title: null,
      created_at: "2026-09-01T10:00:00Z",
      last_message_at: "2026-09-20T10:00:00Z",
      messages_count: 3,
      purge_at: "2026-09-23T10:00:00Z",
    })
    expect(result.success).toBe(true)
  })

  test("accepts a chat without purge_at", () => {
    const result = chatListItemSchema.safeParse({
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      title: "Помидоры",
      created_at: "2026-09-01T10:00:00Z",
      last_message_at: "2026-09-20T10:00:00Z",
      messages_count: 3,
    })
    expect(result.success).toBe(true)
  })

  test("rejects a chat missing created_at", () => {
    const result = chatListItemSchema.safeParse({
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      title: "Помидоры",
      last_message_at: "2026-09-20T10:00:00Z",
      messages_count: 3,
    })
    expect(result.success).toBe(false)
  })
})

describe("chatMessagesResponseSchema", () => {
  test("accepts a page of messages with has_more", () => {
    const result = chatMessagesResponseSchema.safeParse({
      messages: [
        {
          id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          user_text: "Жёлтые листья",
          user_image: null,
          answer: "Похоже на нехватку азота",
          created_at: "2026-09-20T10:00:00Z",
        },
      ],
      has_more: true,
    })
    expect(result.success).toBe(true)
  })

  test("rejects a response without has_more", () => {
    const result = chatMessagesResponseSchema.safeParse({ messages: [] })
    expect(result.success).toBe(false)
  })
})

describe("chatMessageSchema", () => {
  test("accepts optional crop and disease_name", () => {
    const result = chatMessageSchema.safeParse({
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      user_text: null,
      user_image: "https://cdn.example.com/leaf.jpg",
      answer: "Ржавчина пшеницы",
      crop: "wheat",
      disease_name: "rust",
      created_at: "2026-09-20T10:00:00Z",
    })
    expect(result.success).toBe(true)
  })
})

describe("chatRenameFormSchema", () => {
  test("rejects an empty title", () => {
    expect(chatRenameFormSchema.safeParse({ title: "" }).success).toBe(false)
  })

  test("rejects a whitespace-only title", () => {
    expect(chatRenameFormSchema.safeParse({ title: "   " }).success).toBe(false)
  })

  test("trims and accepts a valid title", () => {
    const result = chatRenameFormSchema.safeParse({ title: "  Томаты  " })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.title).toBe("Томаты")
  })

  test("rejects a title over 200 characters", () => {
    expect(chatRenameFormSchema.safeParse({ title: "a".repeat(201) }).success).toBe(false)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun test src/lib/chat-schemas.test.ts`
Expected: FAIL — `chatListItemSchema`, `chatMessageSchema`, `chatMessagesResponseSchema`, `chatRenameFormSchema` are not exported yet.

- [ ] **Step 3: Add the schemas**

Append to `src/lib/chat-schemas.ts` (keep the existing `chatCreateResponseSchema`, `chatIdSchema`, `diagnosisResponseSchema`, `chatCoordsSchema` as-is):

```ts
import type {
  ChatListItemSchema,
  ChatMessageSchema,
} from "@/src/api/generated/models"

export const chatListItemSchema: z.ZodType<ChatListItemSchema> = z.object({
  id: z.uuid(),
  title: z.string().nullable(),
  created_at: z.string(),
  last_message_at: z.string(),
  messages_count: z.number(),
  purge_at: z.string().nullable().optional(),
})

export const chatMessageSchema: z.ZodType<ChatMessageSchema> = z.object({
  id: z.uuid(),
  user_text: z.string().nullable(),
  user_image: z.string().nullable(),
  answer: z.string().nullable(),
  crop: z.string().optional(),
  disease_name: z.string().optional(),
  created_at: z.string(),
})

export const chatMessagesResponseSchema = z.object({
  messages: z.array(chatMessageSchema),
  has_more: z.boolean(),
})

export const chatRenameFormSchema = z.object({
  title: z.string().trim().min(1).max(200),
})
```

Add the new `import type { ChatListItemSchema, ChatMessageSchema } from "@/src/api/generated/models"` alongside the existing `ChatOutSchema, DiagnosisResponseSchema` import at the top of the file (merge into one import statement from the same module).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun test src/lib/chat-schemas.test.ts`
Expected: PASS (all cases above).

- [ ] **Step 5: Commit**

```bash
git add src/lib/chat-schemas.ts src/lib/chat-schemas.test.ts
git commit -m "feat: add zod schemas for chat history list, messages, and rename"
```

---

### Task 2: Shared API error helper

**Files:**
- Create: `src/lib/api-route-helpers.ts`
- Modify: `app/api/profile/route.ts` (remove local `handleApiError`, import shared one)
- Modify: `app/api/chat/message/route.ts` (replace inline catch-block logic with shared helper)

**Interfaces:**
- Consumes: `ApiError` from `src/lib/api-server.ts`, `clearAuthCookies` from `src/lib/auth-cookies.ts`, `Dictionary` from `src/i18n/dictionaries.ts` (all already exist).
- Produces: `handleApiError(error: unknown, ru: Dictionary, tag: string): Promise<NextResponse>` — consumed by Task 3's four new route handlers and by the two modified handlers here.

- [ ] **Step 1: Create the shared helper**

Create `src/lib/api-route-helpers.ts`:

```ts
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ApiError } from "@/src/lib/api-server"
import { clearAuthCookies } from "@/src/lib/auth-cookies"
import type { Dictionary } from "@/src/i18n/dictionaries"

export async function handleApiError(
  error: unknown,
  ru: Dictionary,
  tag: string
): Promise<NextResponse> {
  if (error instanceof ApiError && error.status === 401) {
    const store = await cookies()
    clearAuthCookies(store)
    return NextResponse.json(
      { message: ru.auth.errors.unauthorized },
      { status: 401 }
    )
  }
  if (error instanceof ApiError) {
    return NextResponse.json(
      { message: error.message, errors: error.fieldErrors },
      { status: error.status }
    )
  }
  console.error(tag, error)
  return NextResponse.json(
    { message: ru.auth.errors.unavailable },
    { status: 500 }
  )
}
```

- [ ] **Step 2: Point `app/api/profile/route.ts` at the shared helper**

In `app/api/profile/route.ts`, delete the local `async function handleApiError(...) {...}` block (lines 14-38 in the current file) and add an import instead:

```ts
import { handleApiError } from "@/src/lib/api-route-helpers"
```

Leave every call site (`return handleApiError(error, ru, "[profile:get]")`, etc.) unchanged — the signature is identical.

- [ ] **Step 3: Point `app/api/chat/message/route.ts` at the shared helper**

In `app/api/chat/message/route.ts`, add the import:

```ts
import { handleApiError } from "@/src/lib/api-route-helpers"
```

Replace the inline `catch (error) { ... }` block at the bottom of `POST` (currently duplicating the 401/ApiError/unknown-error logic) with:

```ts
  } catch (error) {
    return handleApiError(error, ru, "[chat/message]")
  }
```

Remove the now-unused `ApiError` and `clearAuthCookies`/`cookies` imports from this file **only if** nothing else in the file still uses them — `cookies()` is still used earlier in `POST` to read the token, so keep that import; `clearAuthCookies` and the direct `ApiError` reference are no longer needed in this file and can be dropped (the check `error instanceof ApiError` moved into the shared helper).

- [ ] **Step 4: Verify nothing broke**

Run: `bunx tsc --noEmit`
Expected: no new errors.

Run: `bun run lint`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/lib/api-route-helpers.ts app/api/profile/route.ts app/api/chat/message/route.ts
git commit -m "refactor: extract shared handleApiError helper for route handlers"
```

---

### Task 3: Chat history proxy routes

**Files:**
- Create: `app/api/chat/route.ts`
- Create: `app/api/chat/[chatId]/route.ts`
- Create: `app/api/chat/[chatId]/messages/route.ts`
- Create: `app/api/chat/[chatId]/restore/route.ts`

**Interfaces:**
- Consumes: `apiFetch` (`src/lib/api-server.ts`), `handleApiError` (Task 2), `TOKEN_COOKIE` (`src/lib/auth-cookies.ts`), `getDict` (`src/i18n/server.ts`), `chatListItemSchema`/`chatMessagesResponseSchema`/`chatRenameFormSchema` (Task 1).
- Produces: `GET /api/chat?deleted=`, `PATCH /api/chat/[chatId]`, `DELETE /api/chat/[chatId]`, `GET /api/chat/[chatId]/messages?before=`, `POST /api/chat/[chatId]/restore` — consumed by `use-chat-history.ts` (Task 9) and `chat-view.tsx` (Task 15).

- [ ] **Step 1: `app/api/chat/route.ts`**

```ts
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { getDict } from "@/src/i18n/server"
import { apiFetch } from "@/src/lib/api-server"
import { handleApiError } from "@/src/lib/api-route-helpers"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import { chatListItemSchema } from "@/src/lib/chat-schemas"

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ru = await getDict()
  const apiMsgs = {
    unavailable: ru.auth.errors.unavailable,
    checkData: ru.auth.errors.checkData,
  }
  try {
    const store = await cookies()
    const token = store.get(TOKEN_COOKIE)?.value
    if (!token) {
      return NextResponse.json(
        { message: ru.auth.errors.unauthorized },
        { status: 401 }
      )
    }

    const deleted = request.nextUrl.searchParams.get("deleted") === "true"
    const query = new URLSearchParams({ limit: "50" })
    if (deleted) query.set("deleted", "true")

    const data = await apiFetch(
      `/chat/?${query.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } },
      apiMsgs
    )
    const parsed = z.array(chatListItemSchema).safeParse(data)
    if (!parsed.success) {
      console.error("[chat:list] unexpected response:", data)
      return NextResponse.json(
        { message: ru.auth.errors.unexpectedResponse },
        { status: 502 }
      )
    }
    return NextResponse.json(parsed.data)
  } catch (error) {
    return handleApiError(error, ru, "[chat:list]")
  }
}
```

- [ ] **Step 2: `app/api/chat/[chatId]/route.ts`**

```ts
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDict } from "@/src/i18n/server"
import { apiFetch } from "@/src/lib/api-server"
import { handleApiError } from "@/src/lib/api-route-helpers"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import { chatRenameFormSchema } from "@/src/lib/chat-schemas"

interface RouteParams {
  params: Promise<{ chatId: string }>
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const ru = await getDict()
  const apiMsgs = {
    unavailable: ru.auth.errors.unavailable,
    checkData: ru.auth.errors.checkData,
  }
  try {
    const { chatId } = await params
    const store = await cookies()
    const token = store.get(TOKEN_COOKIE)?.value
    if (!token) {
      return NextResponse.json(
        { message: ru.auth.errors.unauthorized },
        { status: 401 }
      )
    }

    const body: unknown = await request.json().catch(() => null)
    const parsed = chatRenameFormSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    const data = await apiFetch(
      `/chat/${chatId}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: parsed.data.title }),
      },
      apiMsgs
    )
    return NextResponse.json(data)
  } catch (error) {
    return handleApiError(error, ru, "[chat:rename]")
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const ru = await getDict()
  const apiMsgs = {
    unavailable: ru.auth.errors.unavailable,
    checkData: ru.auth.errors.checkData,
  }
  try {
    const { chatId } = await params
    const store = await cookies()
    const token = store.get(TOKEN_COOKIE)?.value
    if (!token) {
      return NextResponse.json(
        { message: ru.auth.errors.unauthorized },
        { status: 401 }
      )
    }

    await apiFetch(
      `/chat/${chatId}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      apiMsgs
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error, ru, "[chat:delete]")
  }
}
```

- [ ] **Step 3: `app/api/chat/[chatId]/messages/route.ts`**

```ts
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDict } from "@/src/i18n/server"
import { apiFetch } from "@/src/lib/api-server"
import { handleApiError } from "@/src/lib/api-route-helpers"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import { chatMessagesResponseSchema } from "@/src/lib/chat-schemas"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
): Promise<NextResponse> {
  const ru = await getDict()
  const apiMsgs = {
    unavailable: ru.auth.errors.unavailable,
    checkData: ru.auth.errors.checkData,
  }
  try {
    const { chatId } = await params
    const store = await cookies()
    const token = store.get(TOKEN_COOKIE)?.value
    if (!token) {
      return NextResponse.json(
        { message: ru.auth.errors.unauthorized },
        { status: 401 }
      )
    }

    const before = request.nextUrl.searchParams.get("before")
    const query = new URLSearchParams({ limit: "50" })
    if (before) query.set("before", before)

    const data = await apiFetch(
      `/chat/${chatId}/messages?${query.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } },
      apiMsgs
    )
    const parsed = chatMessagesResponseSchema.safeParse(data)
    if (!parsed.success) {
      console.error("[chat:messages] unexpected response:", data)
      return NextResponse.json(
        { message: ru.auth.errors.unexpectedResponse },
        { status: 502 }
      )
    }
    return NextResponse.json(parsed.data)
  } catch (error) {
    return handleApiError(error, ru, "[chat:messages]")
  }
}
```

- [ ] **Step 4: `app/api/chat/[chatId]/restore/route.ts`**

```ts
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDict } from "@/src/i18n/server"
import { apiFetch } from "@/src/lib/api-server"
import { handleApiError } from "@/src/lib/api-route-helpers"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
): Promise<NextResponse> {
  const ru = await getDict()
  const apiMsgs = {
    unavailable: ru.auth.errors.unavailable,
    checkData: ru.auth.errors.checkData,
  }
  try {
    const { chatId } = await params
    const store = await cookies()
    const token = store.get(TOKEN_COOKIE)?.value
    if (!token) {
      return NextResponse.json(
        { message: ru.auth.errors.unauthorized },
        { status: 401 }
      )
    }

    const data = await apiFetch(
      `/chat/${chatId}/restore`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      apiMsgs
    )
    return NextResponse.json(data)
  } catch (error) {
    return handleApiError(error, ru, "[chat:restore]")
  }
}
```

- [ ] **Step 5: Verify types and lint**

Run: `bunx tsc --noEmit && bun run lint`
Expected: clean.

- [ ] **Step 6: Manual smoke test against the live backend**

With a valid session cookie in the browser (log in at `/login` first), open devtools and run:

```js
fetch("/api/chat?limit=50").then((r) => r.json()).then(console.log)
```

Expected: an array of chat objects (or `[]`), not a 500. Without logging in first (clear cookies), the same call should return `{"message": "..."}` with status 401.

- [ ] **Step 7: Commit**

```bash
git add app/api/chat/route.ts app/api/chat/[chatId]/route.ts app/api/chat/[chatId]/messages/route.ts app/api/chat/[chatId]/restore/route.ts
git commit -m "feat: add chat history proxy routes (list, rename, delete, messages, restore)"
```

---

### Task 4: New icons

**Files:**
- Modify: `src/components/ui/icons.tsx`

**Interfaces:**
- Produces: `PencilSimpleIcon`, `TrashIcon`, `ArrowCounterClockwiseIcon` (type `AppIcon`, same shape as every other export in this file) — consumed by `chat-history-item.tsx` (Task 10) and `chat-history-panel.tsx` (Task 11).

- [ ] **Step 1: Add the phosphor imports**

In `src/components/ui/icons.tsx`, add to the existing `import { ... } from "@phosphor-icons/react/dist/ssr"` block (keep the list alphabetical, matching the existing style):

```ts
  ArrowCounterClockwiseIcon as PhosphorArrowCounterClockwiseIcon,
  PencilSimpleIcon as PhosphorPencilSimpleIcon,
  TrashIcon as PhosphorTrashIcon,
```

- [ ] **Step 2: Export the wrapped icons**

Add near the other `createIcon(...)` exports:

```ts
export const PencilSimpleIcon = createIcon(PhosphorPencilSimpleIcon)
export const TrashIcon = createIcon(PhosphorTrashIcon)
export const ArrowCounterClockwiseIcon = createIcon(PhosphorArrowCounterClockwiseIcon)
```

- [ ] **Step 3: Verify it compiles**

Run: `bunx tsc --noEmit`
Expected: no errors (confirms the three icon names exist in `@phosphor-icons/react`).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/icons.tsx
git commit -m "feat: add pencil, trash, and restore icons for chat history"
```

---

### Task 5: i18n keys

**Files:**
- Modify: `src/i18n/ru.json`
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/ky.json`

**Interfaces:**
- Produces: `dict.chat.history.*` — consumed by `chat-history-panel.tsx` (Task 11), `chat-history-item.tsx` (Task 10), `chat-view.tsx` (Task 15).

- [ ] **Step 1: Add the `history` block under `chat` in `ru.json`**

Insert as a new key inside the existing `"chat": { ... }` object (alongside `"geoWarning"` and `"errors"`):

```json
  "history": {
    "today": "Сегодня",
    "yesterday": "Вчера",
    "last7Days": "7 дней",
    "trash": "Корзина",
    "backToChats": "К чатам",
    "rename": "Переименовать чат",
    "delete": "Удалить чат",
    "restore": "Восстановить чат",
    "confirmDeleteTitle": "Удалить «{title}»?",
    "confirmDeleteCancel": "Отмена",
    "confirmDeleteConfirm": "Удалить",
    "emptyChats": "Пока нет чатов",
    "emptyTrash": "Корзина пуста",
    "renameInputLabel": "Название чата",
    "errors": {
      "notFound": "Чат не найден",
      "noAccess": "Нет доступа к этому чату",
      "restoreExpired": "Чат больше нельзя восстановить",
      "renameFailed": "Не получилось переименовать чат",
      "deleteFailed": "Не получилось удалить чат",
      "restoreFailed": "Не получилось восстановить чат"
    }
  }
```

- [ ] **Step 2: Add the same block (translated) to `en.json`**

```json
  "history": {
    "today": "Today",
    "yesterday": "Yesterday",
    "last7Days": "Last 7 days",
    "trash": "Trash",
    "backToChats": "Back to chats",
    "rename": "Rename chat",
    "delete": "Delete chat",
    "restore": "Restore chat",
    "confirmDeleteTitle": "Delete \"{title}\"?",
    "confirmDeleteCancel": "Cancel",
    "confirmDeleteConfirm": "Delete",
    "emptyChats": "No chats yet",
    "emptyTrash": "Trash is empty",
    "renameInputLabel": "Chat title",
    "errors": {
      "notFound": "Chat not found",
      "noAccess": "You don't have access to this chat",
      "restoreExpired": "This chat can no longer be restored",
      "renameFailed": "Couldn't rename the chat",
      "deleteFailed": "Couldn't delete the chat",
      "restoreFailed": "Couldn't restore the chat"
    }
  }
```

- [ ] **Step 3: Add the same block (Kyrgyz) to `ky.json`**

```json
  "history": {
    "today": "Бүгүн",
    "yesterday": "Кечээ",
    "last7Days": "7 күн",
    "trash": "Себет",
    "backToChats": "Чаттарга кайтуу",
    "rename": "Чатты өзгөртүү",
    "delete": "Чатты өчүрүү",
    "restore": "Чатты калыбына келтирүү",
    "confirmDeleteTitle": "«{title}» өчүрүлсүнбү?",
    "confirmDeleteCancel": "Жокко чыгаруу",
    "confirmDeleteConfirm": "Өчүрүү",
    "emptyChats": "Азырынча чаттар жок",
    "emptyTrash": "Себет бош",
    "renameInputLabel": "Чаттын аталышы",
    "errors": {
      "notFound": "Чат табылган жок",
      "noAccess": "Бул чатка кирүү мүмкүн эмес",
      "restoreExpired": "Бул чатты мындан ары калыбына келтирүү мүмкүн эмес",
      "renameFailed": "Чаттын атын өзгөртүү мүмкүн болгон жок",
      "deleteFailed": "Чатты өчүрүү мүмкүн болгон жок",
      "restoreFailed": "Чатты калыбына келтирүү мүмкүн болгон жок"
    }
  }
```

Note in the PR description that the Kyrgyz strings are a machine/non-native translation and should be reviewed by a native speaker, matching how prior KY additions in this repo were flagged (see `docs/superpowers/specs/2026-07-17-chat-geolocation-design.md`).

- [ ] **Step 4: Verify the JSON is valid and the app still builds**

Run: `python3 -c "import json; [json.load(open(f'src/i18n/{l}.json')) for l in ('ru','en','ky')]" && echo OK`
Expected: `OK` (all three files still parse).

Run: `bunx tsc --noEmit`
Expected: no errors (the `Dictionary` type is `typeof ru`, so `ru.json`'s new shape is now required — confirms `en.json`/`ky.json` don't need their own type, but any code referencing `dict.chat.history.*` will only type-check once this step passes).

- [ ] **Step 5: Commit**

```bash
git add src/i18n/ru.json src/i18n/en.json src/i18n/ky.json
git commit -m "feat: add chat history i18n strings (ru/en/ky)"
```

---

### Task 6: Pure date-grouping function

**Files:**
- Create: `src/components/chat/chat-history-grouping.ts`
- Test: `src/components/chat/chat-history-grouping.test.ts`

**Interfaces:**
- Consumes: `ChatListItemSchema` type from `src/api/generated/models`.
- Produces: `groupChatsByDate(items, now): ChatGroup[]`, `type ChatGroup = { key: "today" | "yesterday" | "last7Days" | "older"; items: ChatListItemSchema[] }` — consumed by `chat-history-panel.tsx` (Task 11).

- [ ] **Step 1: Write the failing tests**

Create `src/components/chat/chat-history-grouping.test.ts`:

```ts
import { describe, expect, test } from "bun:test"
import { groupChatsByDate } from "./chat-history-grouping"
import type { ChatListItemSchema } from "@/src/api/generated/models"

function chat(id: string, lastMessageAt: string): ChatListItemSchema {
  return {
    id,
    title: `chat-${id}`,
    created_at: lastMessageAt,
    last_message_at: lastMessageAt,
    messages_count: 1,
  }
}

describe("groupChatsByDate", () => {
  const now = new Date("2026-09-29T12:00:00")

  test("buckets today, yesterday, last7Days, and older correctly", () => {
    const items = [
      chat("today-chat", "2026-09-29T08:00:00"),
      chat("yesterday-chat", "2026-09-28T08:00:00"),
      chat("week-chat", "2026-09-24T08:00:00"),
      chat("old-chat", "2026-09-01T08:00:00"),
    ]

    const groups = groupChatsByDate(items, now)

    expect(groups).toEqual([
      { key: "today", items: [items[0]] },
      { key: "yesterday", items: [items[1]] },
      { key: "last7Days", items: [items[2]] },
      { key: "older", items: [items[3]] },
    ])
  })

  test("omits empty groups", () => {
    const items = [chat("today-chat", "2026-09-29T08:00:00")]
    const groups = groupChatsByDate(items, now)
    expect(groups).toEqual([{ key: "today", items }])
  })

  test("returns an empty array for no chats", () => {
    expect(groupChatsByDate([], now)).toEqual([])
  })

  test("treats exactly 7 days ago as last7Days, and 8 days ago as older", () => {
    const items = [
      chat("seven-days", "2026-09-22T08:00:00"),
      chat("eight-days", "2026-09-21T08:00:00"),
    ]
    const groups = groupChatsByDate(items, now)
    expect(groups).toEqual([
      { key: "last7Days", items: [items[0]] },
      { key: "older", items: [items[1]] },
    ])
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun test src/components/chat/chat-history-grouping.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `groupChatsByDate`**

Create `src/components/chat/chat-history-grouping.ts`:

```ts
import type { ChatListItemSchema } from "@/src/api/generated/models"

export type ChatGroupKey = "today" | "yesterday" | "last7Days" | "older"

export interface ChatGroup {
  key: ChatGroupKey
  items: ChatListItemSchema[]
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function groupChatsByDate(
  items: ChatListItemSchema[],
  now: Date
): ChatGroup[] {
  const today = startOfDay(now)
  const yesterday = today - 86_400_000
  const sevenDaysAgo = today - 7 * 86_400_000

  const buckets: Record<ChatGroupKey, ChatListItemSchema[]> = {
    today: [],
    yesterday: [],
    last7Days: [],
    older: [],
  }

  for (const item of items) {
    const day = startOfDay(new Date(item.last_message_at))
    if (day === today) buckets.today.push(item)
    else if (day === yesterday) buckets.yesterday.push(item)
    else if (day >= sevenDaysAgo) buckets.last7Days.push(item)
    else buckets.older.push(item)
  }

  return (["today", "yesterday", "last7Days", "older"] as const)
    .map((key) => ({ key, items: buckets[key] }))
    .filter((group) => group.items.length > 0)
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun test src/components/chat/chat-history-grouping.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/chat-history-grouping.ts src/components/chat/chat-history-grouping.test.ts
git commit -m "feat: add pure date-grouping for chat history list"
```

---

### Task 7: Pure chat history state reducer

**Files:**
- Create: `src/components/chat/chat-history-state.ts`
- Test: `src/components/chat/chat-history-state.test.ts`

**Interfaces:**
- Consumes: `ChatListItemSchema` type from `src/api/generated/models`.
- Produces:
  - `interface ChatHistoryState { view: "chats" | "trash"; items: ChatListItemSchema[]; status: "idle" | "loading" | "ready" | "error"; renamingId: string | null; pendingDeleteId: string | null }`
  - `type ChatHistoryAction` (union, listed in Step 3)
  - `createChatHistoryState(): ChatHistoryState`
  - `reduceChatHistory(state, action): ChatHistoryState`
  - `shouldRedirectAfterRemoval(removedId: string, activeChatId: string | null): boolean`
  - `shouldRollbackAfterFailure(status: number): boolean`
  - All consumed by `use-chat-history.ts` (Task 9).

- [ ] **Step 1: Write the failing tests**

Create `src/components/chat/chat-history-state.test.ts`:

```ts
import { describe, expect, test } from "bun:test"
import {
  createChatHistoryState,
  reduceChatHistory,
  shouldRedirectAfterRemoval,
  shouldRollbackAfterFailure,
} from "./chat-history-state"
import type { ChatListItemSchema } from "@/src/api/generated/models"

function chat(id: string, title: string | null = "Помидоры"): ChatListItemSchema {
  return {
    id,
    title,
    created_at: "2026-09-01T00:00:00Z",
    last_message_at: "2026-09-20T00:00:00Z",
    messages_count: 1,
  }
}

describe("reduceChatHistory", () => {
  test("view-changed resets items and sets loading", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-succeeded", items: [chat("a")] })
    state = reduceChatHistory(state, { type: "view-changed", view: "trash" })

    expect(state.view).toBe("trash")
    expect(state.items).toEqual([])
    expect(state.status).toBe("loading")
  })

  test("load-succeeded stores items and sets ready", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-started" })
    state = reduceChatHistory(state, { type: "load-succeeded", items: [chat("a")] })

    expect(state.status).toBe("ready")
    expect(state.items).toEqual([chat("a")])
  })

  test("load-failed sets error status", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-started" })
    state = reduceChatHistory(state, { type: "load-failed" })

    expect(state.status).toBe("error")
  })

  test("rename-optimistic updates the matching item's title and clears renamingId", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-succeeded", items: [chat("a", "Old")] })
    state = reduceChatHistory(state, { type: "rename-started", id: "a" })
    state = reduceChatHistory(state, {
      type: "rename-optimistic",
      id: "a",
      title: "New",
    })

    expect(state.renamingId).toBeNull()
    expect(state.items[0].title).toBe("New")
  })

  test("rename-failed rolls back to the previous title", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-succeeded", items: [chat("a", "Old")] })
    state = reduceChatHistory(state, {
      type: "rename-optimistic",
      id: "a",
      title: "New",
    })
    state = reduceChatHistory(state, {
      type: "rename-failed",
      id: "a",
      previousTitle: "Old",
    })

    expect(state.items[0].title).toBe("Old")
  })

  test("delete-optimistic removes the item and clears pendingDeleteId", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-succeeded", items: [chat("a"), chat("b")] })
    state = reduceChatHistory(state, { type: "delete-requested", id: "b" })
    state = reduceChatHistory(state, { type: "delete-optimistic", id: "b" })

    expect(state.pendingDeleteId).toBeNull()
    expect(state.items.map((i) => i.id)).toEqual(["a"])
  })

  test("delete-failed re-inserts the item at its original index", () => {
    let state = createChatHistoryState()
    const items = [chat("a"), chat("b"), chat("c")]
    state = reduceChatHistory(state, { type: "load-succeeded", items })
    state = reduceChatHistory(state, { type: "delete-optimistic", id: "b" })
    state = reduceChatHistory(state, {
      type: "delete-failed",
      item: items[1],
      index: 1,
    })

    expect(state.items.map((i) => i.id)).toEqual(["a", "b", "c"])
  })

  test("restore-optimistic removes the item; restore-failed re-inserts it", () => {
    let state = createChatHistoryState()
    const items = [chat("a"), chat("b")]
    state = reduceChatHistory(state, { type: "load-succeeded", items })
    state = reduceChatHistory(state, { type: "restore-optimistic", id: "a" })
    expect(state.items.map((i) => i.id)).toEqual(["b"])

    state = reduceChatHistory(state, {
      type: "restore-failed",
      item: items[0],
      index: 0,
    })
    expect(state.items.map((i) => i.id)).toEqual(["a", "b"])
  })

  test("delete-cancelled and rename-cancelled clear their pending ids without touching items", () => {
    let state = createChatHistoryState()
    state = reduceChatHistory(state, { type: "load-succeeded", items: [chat("a")] })
    state = reduceChatHistory(state, { type: "delete-requested", id: "a" })
    state = reduceChatHistory(state, { type: "delete-cancelled" })
    expect(state.pendingDeleteId).toBeNull()
    expect(state.items).toHaveLength(1)

    state = reduceChatHistory(state, { type: "rename-started", id: "a" })
    state = reduceChatHistory(state, { type: "rename-cancelled" })
    expect(state.renamingId).toBeNull()
    expect(state.items[0].title).toBe("Помидоры")
  })
})

describe("shouldRedirectAfterRemoval", () => {
  test("is true when the removed chat is the active one", () => {
    expect(shouldRedirectAfterRemoval("a", "a")).toBe(true)
  })

  test("is false when the removed chat is not the active one", () => {
    expect(shouldRedirectAfterRemoval("a", "b")).toBe(false)
  })

  test("is false when there is no active chat", () => {
    expect(shouldRedirectAfterRemoval("a", null)).toBe(false)
  })
})

describe("shouldRollbackAfterFailure", () => {
  test("is false for a 404 (expired/gone) — no rollback, stays removed", () => {
    expect(shouldRollbackAfterFailure(404)).toBe(false)
  })

  test("is true for any other failure status", () => {
    expect(shouldRollbackAfterFailure(500)).toBe(true)
    expect(shouldRollbackAfterFailure(403)).toBe(true)
    expect(shouldRollbackAfterFailure(0)).toBe(true)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun test src/components/chat/chat-history-state.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the reducer**

Create `src/components/chat/chat-history-state.ts`:

```ts
import type { ChatListItemSchema } from "@/src/api/generated/models"

export type ChatHistoryView = "chats" | "trash"
export type ChatHistoryStatus = "idle" | "loading" | "ready" | "error"

export interface ChatHistoryState {
  view: ChatHistoryView
  items: ChatListItemSchema[]
  status: ChatHistoryStatus
  renamingId: string | null
  pendingDeleteId: string | null
}

export type ChatHistoryAction =
  | { type: "view-changed"; view: ChatHistoryView }
  | { type: "load-started" }
  | { type: "load-succeeded"; items: ChatListItemSchema[] }
  | { type: "load-failed" }
  | { type: "rename-started"; id: string }
  | { type: "rename-cancelled" }
  | { type: "rename-optimistic"; id: string; title: string }
  | { type: "rename-failed"; id: string; previousTitle: string | null }
  | { type: "delete-requested"; id: string }
  | { type: "delete-cancelled" }
  | { type: "delete-optimistic"; id: string }
  | { type: "delete-failed"; item: ChatListItemSchema; index: number }
  | { type: "restore-optimistic"; id: string }
  | { type: "restore-failed"; item: ChatListItemSchema; index: number }

export function createChatHistoryState(): ChatHistoryState {
  return {
    view: "chats",
    items: [],
    status: "idle",
    renamingId: null,
    pendingDeleteId: null,
  }
}

function reinsert(
  items: ChatListItemSchema[],
  item: ChatListItemSchema,
  index: number
): ChatListItemSchema[] {
  const next = items.slice()
  next.splice(Math.min(index, next.length), 0, item)
  return next
}

export function reduceChatHistory(
  state: ChatHistoryState,
  action: ChatHistoryAction
): ChatHistoryState {
  switch (action.type) {
    case "view-changed":
      return {
        ...state,
        view: action.view,
        items: [],
        status: "loading",
        renamingId: null,
        pendingDeleteId: null,
      }
    case "load-started":
      return { ...state, status: "loading" }
    case "load-succeeded":
      return { ...state, status: "ready", items: action.items }
    case "load-failed":
      return { ...state, status: "error" }
    case "rename-started":
      return { ...state, renamingId: action.id }
    case "rename-cancelled":
      return { ...state, renamingId: null }
    case "rename-optimistic":
      return {
        ...state,
        renamingId: null,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, title: action.title } : item
        ),
      }
    case "rename-failed":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, title: action.previousTitle } : item
        ),
      }
    case "delete-requested":
      return { ...state, pendingDeleteId: action.id }
    case "delete-cancelled":
      return { ...state, pendingDeleteId: null }
    case "delete-optimistic":
      return {
        ...state,
        pendingDeleteId: null,
        items: state.items.filter((item) => item.id !== action.id),
      }
    case "delete-failed":
      return { ...state, items: reinsert(state.items, action.item, action.index) }
    case "restore-optimistic":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      }
    case "restore-failed":
      return { ...state, items: reinsert(state.items, action.item, action.index) }
  }
}

export function shouldRedirectAfterRemoval(
  removedId: string,
  activeChatId: string | null
): boolean {
  return removedId === activeChatId
}

export function shouldRollbackAfterFailure(status: number): boolean {
  return status !== 404
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun test src/components/chat/chat-history-state.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/chat-history-state.ts src/components/chat/chat-history-state.test.ts
git commit -m "feat: add pure chat history state reducer with optimistic rollback"
```

---

### Task 8: History message mapping and response parsing

**Files:**
- Create: `src/components/chat/chat-history-mapping.ts`
- Test: `src/components/chat/chat-history-mapping.test.ts`

**Interfaces:**
- Consumes: `ChatMessage` type from `./types`.
- Produces: `mapHistoryMessage(msg): ChatMessage[]`, `parseHistoryResponse(data: unknown): { messages: HistoryMessage[]; has_more: boolean } | null`, `type HistoryMessage` — consumed by `chat-view.tsx` (Task 15).

- [ ] **Step 1: Write the failing tests**

Create `src/components/chat/chat-history-mapping.test.ts`:

```ts
import { describe, expect, test } from "bun:test"
import { mapHistoryMessage, parseHistoryResponse } from "./chat-history-mapping"

describe("mapHistoryMessage", () => {
  test("maps a text-only turn to a user message and a bot message", () => {
    const result = mapHistoryMessage({
      id: "m1",
      user_text: "Жёлтые листья",
      user_image: null,
      answer: "Похоже на нехватку азота",
      created_at: "2026-09-20T10:00:00Z",
    })

    expect(result).toEqual([
      { id: "m1-user", role: "user", text: "Жёлтые листья", imageUrl: undefined },
      { id: "m1-bot", role: "bot", text: "Похоже на нехватку азота" },
    ])
  })

  test("maps an image-only turn without a user text message losing the image", () => {
    const result = mapHistoryMessage({
      id: "m2",
      user_text: null,
      user_image: "https://cdn.example.com/leaf.jpg",
      answer: "Ржавчина",
      created_at: "2026-09-20T10:00:00Z",
    })

    expect(result[0]).toEqual({
      id: "m2-user",
      role: "user",
      text: "",
      imageUrl: "https://cdn.example.com/leaf.jpg",
    })
  })

  test("skips the user turn entirely when there is neither text nor image", () => {
    const result = mapHistoryMessage({
      id: "m3",
      user_text: null,
      user_image: null,
      answer: "Ответ",
      created_at: "2026-09-20T10:00:00Z",
    })

    expect(result).toHaveLength(1)
    expect(result[0].role).toBe("bot")
  })

  test("skips the bot turn when answer is null", () => {
    const result = mapHistoryMessage({
      id: "m4",
      user_text: "Вопрос без ответа",
      user_image: null,
      answer: null,
      created_at: "2026-09-20T10:00:00Z",
    })

    expect(result).toHaveLength(1)
    expect(result[0].role).toBe("user")
  })
})

describe("parseHistoryResponse", () => {
  test("accepts a well-formed response", () => {
    const result = parseHistoryResponse({
      messages: [
        {
          id: "m1",
          user_text: "test",
          user_image: null,
          answer: "ok",
          created_at: "2026-09-20T10:00:00Z",
        },
      ],
      has_more: false,
    })
    expect(result).not.toBeNull()
    expect(result?.has_more).toBe(false)
  })

  test("rejects a response missing has_more", () => {
    expect(parseHistoryResponse({ messages: [] })).toBeNull()
  })

  test("rejects a response where messages is not an array", () => {
    expect(parseHistoryResponse({ messages: "oops", has_more: false })).toBeNull()
  })

  test("rejects null and non-object input", () => {
    expect(parseHistoryResponse(null)).toBeNull()
    expect(parseHistoryResponse("oops")).toBeNull()
    expect(parseHistoryResponse(undefined)).toBeNull()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun test src/components/chat/chat-history-mapping.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the mapping and parser**

Create `src/components/chat/chat-history-mapping.ts`:

```ts
import type { ChatMessage } from "./types"

export interface HistoryMessage {
  id: string
  user_text: string | null
  user_image: string | null
  answer: string | null
  created_at: string
}

export interface HistoryResponse {
  messages: HistoryMessage[]
  has_more: boolean
}

export function mapHistoryMessage(message: HistoryMessage): ChatMessage[] {
  const out: ChatMessage[] = []

  if (message.user_text || message.user_image) {
    out.push({
      id: `${message.id}-user`,
      role: "user",
      text: message.user_text ?? "",
      imageUrl: message.user_image ?? undefined,
    })
  }

  if (message.answer) {
    out.push({
      id: `${message.id}-bot`,
      role: "bot",
      text: message.answer,
    })
  }

  return out
}

export function parseHistoryResponse(data: unknown): HistoryResponse | null {
  if (
    data !== null &&
    typeof data === "object" &&
    "messages" in data &&
    Array.isArray(data.messages) &&
    "has_more" in data &&
    typeof data.has_more === "boolean"
  ) {
    return data as HistoryResponse
  }
  return null
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun test src/components/chat/chat-history-mapping.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/chat-history-mapping.ts src/components/chat/chat-history-mapping.test.ts
git commit -m "feat: add history message mapping and response parsing"
```

---

### Task 9: `use-chat-history` hook

**Files:**
- Create: `src/components/chat/use-chat-history.ts`

**Interfaces:**
- Consumes: `reduceChatHistory`, `createChatHistoryState`, `shouldRedirectAfterRemoval`, `shouldRollbackAfterFailure` (Task 7); `chatListItemSchema` shape via `/api/chat*` routes (Task 3); `useI18n` (`src/i18n/client.tsx`); `toast` from `react-hot-toast`.
- Produces:
```ts
function useChatHistory(
  activeChatId: string | null,
  onActiveChatRemoved: () => void
): {
  view: "chats" | "trash"
  items: ChatListItemSchema[]
  status: "idle" | "loading" | "ready" | "error"
  renamingId: string | null
  pendingDeleteId: string | null
  toggleView: () => void
  startRename: (id: string) => void
  cancelRename: () => void
  submitRename: (id: string, title: string) => void
  requestDelete: (id: string) => void
  cancelDelete: () => void
  confirmDelete: (id: string) => void
  restoreChat: (id: string) => void
}
```
  Consumed by `chat-history-panel.tsx` (Task 11).

- [ ] **Step 1: Implement the hook**

Create `src/components/chat/use-chat-history.ts`:

```ts
"use client"

import { useEffect, useReducer } from "react"
import toast from "react-hot-toast"
import { useI18n } from "@/src/i18n/client"
import {
  createChatHistoryState,
  reduceChatHistory,
  shouldRedirectAfterRemoval,
  shouldRollbackAfterFailure,
} from "./chat-history-state"

export function useChatHistory(
  activeChatId: string | null,
  onActiveChatRemoved: () => void
) {
  const { dict } = useI18n()
  const [state, dispatch] = useReducer(reduceChatHistory, createChatHistoryState())

  useEffect(() => {
    let cancelled = false
    dispatch({ type: "load-started" })

    fetch(`/api/chat?deleted=${state.view === "trash"}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json()
      })
      .then((items) => {
        if (!cancelled) dispatch({ type: "load-succeeded", items })
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "load-failed" })
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.view])

  const toggleView = () => {
    dispatch({ type: "view-changed", view: state.view === "chats" ? "trash" : "chats" })
  }

  const startRename = (id: string) => dispatch({ type: "rename-started", id })
  const cancelRename = () => dispatch({ type: "rename-cancelled" })

  const submitRename = (id: string, title: string) => {
    const previousTitle = state.items.find((item) => item.id === id)?.title ?? null
    dispatch({ type: "rename-optimistic", id, title })
    void fetch(`/api/chat/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then((res) => {
      if (!res.ok) {
        dispatch({ type: "rename-failed", id, previousTitle })
        toast.error(dict.chat.history.errors.renameFailed)
      }
    })
  }

  const requestDelete = (id: string) => dispatch({ type: "delete-requested", id })
  const cancelDelete = () => dispatch({ type: "delete-cancelled" })

  const confirmDelete = (id: string) => {
    const index = state.items.findIndex((item) => item.id === id)
    const item = state.items[index]
    dispatch({ type: "delete-optimistic", id })
    if (shouldRedirectAfterRemoval(id, activeChatId)) onActiveChatRemoved()

    void fetch(`/api/chat/${id}`, { method: "DELETE" }).then((res) => {
      if (!res.ok && item && shouldRollbackAfterFailure(res.status)) {
        dispatch({ type: "delete-failed", item, index })
        toast.error(dict.chat.history.errors.deleteFailed)
      }
    })
  }

  const restoreChat = (id: string) => {
    const index = state.items.findIndex((item) => item.id === id)
    const item = state.items[index]
    dispatch({ type: "restore-optimistic", id })

    void fetch(`/api/chat/${id}/restore`, { method: "POST" }).then((res) => {
      if (res.ok) return
      if (res.status === 404) {
        toast.error(dict.chat.history.errors.restoreExpired)
        return
      }
      if (item && shouldRollbackAfterFailure(res.status)) {
        dispatch({ type: "restore-failed", item, index })
        toast.error(dict.chat.history.errors.restoreFailed)
      }
    })
  }

  return {
    view: state.view,
    items: state.items,
    status: state.status,
    renamingId: state.renamingId,
    pendingDeleteId: state.pendingDeleteId,
    toggleView,
    startRename,
    cancelRename,
    submitRename,
    requestDelete,
    cancelDelete,
    confirmDelete,
    restoreChat,
  }
}
```

- [ ] **Step 2: Verify types**

Run: `bunx tsc --noEmit`
Expected: no new errors (this hook isn't consumed yet, but must type-check standalone).

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/use-chat-history.ts
git commit -m "feat: add use-chat-history hook wiring reducer to the proxy routes"
```

---

### Task 10: `ChatHistoryItem` component

**Files:**
- Create: `src/components/chat/chat-history-item.tsx`

**Interfaces:**
- Consumes: `PencilSimpleIcon`, `TrashIcon`, `ArrowCounterClockwiseIcon` (Task 4); `SPRING_SNAPPY` (`src/lib/motion-tokens.ts`); `useI18n`; `ChatListItemSchema` type.
- Produces:
```ts
interface ChatHistoryItemProps {
  item: ChatListItemSchema
  isActive: boolean
  isTrash: boolean
  isRenaming: boolean
  isPendingDelete: boolean
  onSelect: (id: string) => void
  onStartRename: (id: string) => void
  onCancelRename: () => void
  onSubmitRename: (id: string, title: string) => void
  onRequestDelete: (id: string) => void
  onCancelDelete: () => void
  onConfirmDelete: (id: string) => void
  onRestore: (id: string) => void
}
function ChatHistoryItem(props: ChatHistoryItemProps): ReactElement
```
  Consumed by `chat-history-panel.tsx` (Task 11).

- [ ] **Step 1: Implement the component**

Create `src/components/chat/chat-history-item.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useI18n } from "@/src/i18n/client";
import {
  ArrowCounterClockwiseIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@/src/components/ui/icons";
import { SPRING_SNAPPY } from "@/src/lib/motion-tokens";
import type { ChatListItemSchema } from "@/src/api/generated/models";

interface ChatHistoryItemProps {
  item: ChatListItemSchema;
  isActive: boolean;
  isTrash: boolean;
  isRenaming: boolean;
  isPendingDelete: boolean;
  onSelect: (id: string) => void;
  onStartRename: (id: string) => void;
  onCancelRename: () => void;
  onSubmitRename: (id: string, title: string) => void;
  onRequestDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

export function ChatHistoryItem({
  item,
  isActive,
  isTrash,
  isRenaming,
  isPendingDelete,
  onSelect,
  onStartRename,
  onCancelRename,
  onSubmitRename,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  onRestore,
}: ChatHistoryItemProps) {
  const { dict, locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = useState(item.title ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      setDraft(item.title ?? "");
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming, item.title]);

  const displayTitle =
    item.title ??
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
      new Date(item.last_message_at),
    );

  const commitRename = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== item.title) onSubmitRename(item.id, trimmed);
    else onCancelRename();
  };

  if (isRenaming) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") commitRename();
          if (event.key === "Escape") onCancelRename();
        }}
        onBlur={commitRename}
        aria-label={dict.chat.history.renameInputLabel}
        maxLength={200}
        className="w-full rounded-md border border-accent bg-white px-2 py-1.5 text-sm text-fg focus-visible:outline-none"
      />
    );
  }

  return (
    <div className="group relative flex items-center">
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className={`flex min-h-9 w-full min-w-0 items-center truncate rounded-lg px-2 py-1.5 text-left text-sm transition-colors duration-150 ${
          isActive
            ? "bg-accent-soft text-accent-strong"
            : "text-fg-muted hover:bg-surface-muted hover:text-fg"
        }`}
      >
        <span className="truncate">{displayTitle}</span>
      </button>

      <div className="absolute right-1 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100">
        {isTrash ? (
          <button
            type="button"
            onClick={() => onRestore(item.id)}
            aria-label={dict.chat.history.restore}
            className="grid size-7 place-items-center rounded-md text-fg-muted hover:bg-surface-muted hover:text-fg"
          >
            <ArrowCounterClockwiseIcon size={16} strokeWidth={1.8} />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onStartRename(item.id)}
              aria-label={dict.chat.history.rename}
              className="grid size-7 place-items-center rounded-md text-fg-muted hover:bg-surface-muted hover:text-fg"
            >
              <PencilSimpleIcon size={16} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={() => onRequestDelete(item.id)}
              aria-label={dict.chat.history.delete}
              className="grid size-7 place-items-center rounded-md text-fg-muted hover:bg-surface-muted hover:text-danger"
            >
              <TrashIcon size={16} strokeWidth={1.8} />
            </button>
          </>
        )}
      </div>

      <AnimatePresence>
        {isPendingDelete && (
          <motion.div
            key="confirm-delete"
            role="alertdialog"
            aria-label={dict.chat.history.confirmDeleteTitle.replace("{title}", displayTitle)}
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={SPRING_SNAPPY}
            className="absolute right-0 top-full z-10 mt-1 w-56 rounded-xl border border-edge bg-white p-3 text-sm shadow-[0_12px_32px_rgba(6,40,28,0.16)]"
          >
            <p className="mb-2 text-fg">
              {dict.chat.history.confirmDeleteTitle.replace("{title}", displayTitle)}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancelDelete}
                className="rounded-lg px-2.5 py-1.5 text-fg-muted hover:bg-surface-muted"
              >
                {dict.chat.history.confirmDeleteCancel}
              </button>
              <button
                type="button"
                onClick={() => onConfirmDelete(item.id)}
                className="rounded-lg bg-danger px-2.5 py-1.5 font-semibold text-white hover:bg-danger/90"
              >
                {dict.chat.history.confirmDeleteConfirm}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/chat-history-item.tsx
git commit -m "feat: add chat history list item with inline rename and delete confirm"
```

---

### Task 11: `ChatHistoryPanel` component

**Files:**
- Create: `src/components/chat/chat-history-panel.tsx`

**Interfaces:**
- Consumes: `useChatHistory` (Task 9), `groupChatsByDate` (Task 6), `ChatHistoryItem` (Task 10), `TrashIcon` (Task 4), `DURATION`/`EASE_OUT` (`src/lib/motion-tokens.ts`).
- Produces:
```ts
interface ChatHistoryPanelProps {
  activeChatId: string | null
  onSelectChat: (id: string) => void
  onActiveChatRemoved: () => void
}
function ChatHistoryPanel(props: ChatHistoryPanelProps): ReactElement
```
  Consumed by `chat-sidebar.tsx` (Task 12).

- [ ] **Step 1: Implement the component**

Create `src/components/chat/chat-history-panel.tsx`:

```tsx
"use client";

import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/src/i18n/client";
import { TrashIcon } from "@/src/components/ui/icons";
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens";
import { ChatHistoryItem } from "./chat-history-item";
import { groupChatsByDate } from "./chat-history-grouping";
import { useChatHistory } from "./use-chat-history";

interface ChatHistoryPanelProps {
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onActiveChatRemoved: () => void;
}

export function ChatHistoryPanel({
  activeChatId,
  onSelectChat,
  onActiveChatRemoved,
}: ChatHistoryPanelProps) {
  const { dict } = useI18n();
  const history = useChatHistory(activeChatId, onActiveChatRemoved);
  const groups = groupChatsByDate(history.items, new Date());
  const isEmpty = history.status === "ready" && groups.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={history.view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.base, ease: EASE_OUT }}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          {isEmpty && (
            <p className="px-2 py-3 text-sm text-fg-faint">
              {history.view === "trash" ? dict.chat.history.emptyTrash : dict.chat.history.emptyChats}
            </p>
          )}

          <AnimatePresence mode="popLayout">
            {groups.map((group) => (
              <div key={group.key} className="mb-2">
                {group.key !== "older" && (
                  <p className="px-2 pb-1 pt-3 text-xs text-fg-faint">
                    {dict.chat.history[group.key]}
                  </p>
                )}
                {group.items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: DURATION.fast, ease: EASE_OUT }}
                  >
                    <ChatHistoryItem
                      item={item}
                      isActive={item.id === activeChatId}
                      isTrash={history.view === "trash"}
                      isRenaming={history.renamingId === item.id}
                      isPendingDelete={history.pendingDeleteId === item.id}
                      onSelect={onSelectChat}
                      onStartRename={history.startRename}
                      onCancelRename={history.cancelRename}
                      onSubmitRename={history.submitRename}
                      onRequestDelete={history.requestDelete}
                      onCancelDelete={history.cancelDelete}
                      onConfirmDelete={history.confirmDelete}
                      onRestore={history.restoreChat}
                    />
                  </motion.div>
                ))}
              </div>
            ))}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={history.toggleView}
        className="mt-2 flex min-h-11 flex-none items-center gap-2 rounded-xl px-2 text-sm text-fg-muted transition-colors duration-150 hover:bg-surface-muted hover:text-fg"
      >
        <TrashIcon size={16} strokeWidth={1.8} />
        {history.view === "trash" ? dict.chat.history.backToChats : dict.chat.history.trash}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/chat-history-panel.tsx
git commit -m "feat: add chat history panel with date grouping and trash toggle"
```

---

### Task 12: Wire the panel into `chat-sidebar.tsx`

**Files:**
- Modify: `src/components/chat/chat-sidebar.tsx`

**Interfaces:**
- Consumes: `ChatHistoryPanel` (Task 11).
- Produces: `ChatSidebarProps` gains `activeChatId: string | null`, `onSelectChat: (id: string) => void`, `onActiveChatRemoved: () => void` — consumed by `chat-shell.tsx` (Task 13).

- [ ] **Step 1: Add the import and new props**

In `src/components/chat/chat-sidebar.tsx`, add the import:

```ts
import { ChatHistoryPanel } from "@/src/components/chat/chat-history-panel";
```

Extend `ChatSidebarProps`:

```ts
interface ChatSidebarProps {
  onNewChat: () => void;
  profile: UserProfile | null;
  onProfileChange: (profile: UserProfile | null) => void;
  isDesktop: boolean;
  desktopExpanded: boolean;
  mobileOpen: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
  onClose: () => void;
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onActiveChatRemoved: () => void;
}
```

Destructure the three new props in the function signature (`ChatSidebar({ ..., activeChatId, onSelectChat, onActiveChatRemoved })`).

- [ ] **Step 2: Replace the spacer with the panel**

Replace this line (currently between the "New chat" button and the footer):

```tsx
<div className="flex-1" />
```

with:

```tsx
{expanded ? (
  <ChatHistoryPanel
    activeChatId={activeChatId}
    onSelectChat={onSelectChat}
    onActiveChatRemoved={onActiveChatRemoved}
  />
) : (
  <div className="flex-1" />
)}
```

(`expanded` is already computed at the top of the component as `!isDesktop || desktopExpanded` — the panel only renders when the rail is wide enough to show text, matching the collapsed 72px desktop rail's icon-only behavior.)

- [ ] **Step 3: Verify types**

Run: `bunx tsc --noEmit`
Expected: errors at the `<ChatSidebar ... />` call site in `chat-shell.tsx` (missing the three new required props) — expected, fixed in Task 13.

- [ ] **Step 4: Commit**

```bash
git add src/components/chat/chat-sidebar.tsx
git commit -m "feat: render chat history panel in the sidebar's expanded state"
```

---

### Task 13: `ChatShell` — active chat state and navigation

**Files:**
- Modify: `src/components/chat/chat-shell.tsx`

**Interfaces:**
- Consumes: `ChatHistoryPanel`'s props contract (Task 12) satisfied here; `useRouter` from `next/navigation`.
- Produces: `ChatShellProps { initialChatId?: string }` — consumed by `app/chat/page.tsx` (unchanged call, no prop) and `app/chat/[chatId]/page.tsx` (Task 14).

- [ ] **Step 1: Rewrite `chat-shell.tsx`**

Replace the full contents of `src/components/chat/chat-shell.tsx` with:

```tsx
"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/src/components/layout/profile-menu";
import { ChatHeader } from "./chat-header";
import { ChatSidebar } from "./chat-sidebar";
import { ChatView } from "./chat-view";
import {
  createSidebarState,
  getSidebarPresentation,
  reduceSidebarState,
} from "./sidebar-state";
import { useViewportHeight } from "../hooks/useViewportHeight";

const DESKTOP_QUERY = "(min-width: 1024px)";

interface ChatShellProps {
  initialChatId?: string;
}

export function ChatShell({ initialChatId }: ChatShellProps) {
  useViewportHeight();
  const router = useRouter();

  const [sessionId, setSessionId] = useState(0);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    initialChatId ?? null,
  );
  const [sidebarState, dispatchSidebar] = useReducer(
    reduceSidebarState,
    createSidebarState(),
  );
  const sidebarTriggerRef = useRef<HTMLButtonElement>(null);
  const { profile, setProfile } = useProfile();

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const syncViewport = () => {
      dispatchSidebar({ type: "viewport-changed", isDesktop: media.matches });
    };

    syncViewport();
    media.addEventListener("change", syncViewport);

    return () => {
      media.removeEventListener("change", syncViewport);
    };
  }, []);

  const presentation = getSidebarPresentation(sidebarState);
  const hasProfileLocation =
    profile !== null &&
    profile.latitude !== null &&
    profile.longitude !== null;

  const startNewChat = () => {
    setSessionId((id) => id + 1);
    setActiveChatId(null);
    dispatchSidebar({ type: "new-chat" });
    router.push("/chat");
  };

  const selectChat = (id: string) => {
    setActiveChatId(id);
    dispatchSidebar({ type: "new-chat" });
    router.push(`/chat/${id}`);
  };

  const handleActiveChatRemoved = () => {
    setActiveChatId(null);
    router.push("/chat");
  };

  return (
    <div
      className="fixed inset-x-0 flex min-h-0 w-full overflow-hidden bg-white"
      style={{
        top: "var(--app-offset-top, 0px)",
        height: "var(--app-height, 100dvh)",
      }}
    >
      <ChatSidebar
        onNewChat={startNewChat}
        profile={profile}
        onProfileChange={setProfile}
        isDesktop={sidebarState.isDesktop}
        desktopExpanded={presentation.desktopExpanded}
        mobileOpen={presentation.mobileOpen}
        triggerRef={sidebarTriggerRef}
        onToggle={() => dispatchSidebar({ type: "toggle" })}
        onClose={() => dispatchSidebar({ type: "close" })}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onActiveChatRemoved={handleActiveChatRemoved}
      />

      <main
        inert={presentation.mobileOpen ? true : undefined}
        className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white"
      >
        <ChatHeader
          profile={profile}
          onProfileChange={setProfile}
          onOpenSidebar={() => dispatchSidebar({ type: "open" })}
          sidebarOpen={presentation.mobileOpen}
          sidebarTriggerRef={sidebarTriggerRef}
        />

        <ChatView
          key={activeChatId ?? `new-${sessionId}`}
          initialChatId={activeChatId}
          hasProfileLocation={hasProfileLocation}
        />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `bunx tsc --noEmit`
Expected: an error at `ChatView`'s call site (`initialChatId` prop doesn't exist yet) — expected, fixed in Task 15. All `ChatSidebar` prop errors from Task 12 should now be gone.

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/chat-shell.tsx
git commit -m "feat: lift active chat id into ChatShell and navigate via router"
```

---

### Task 14: `/chat/[chatId]` dynamic route

**Files:**
- Create: `app/chat/[chatId]/page.tsx`

**Interfaces:**
- Consumes: `ChatShell` (Task 13), `chatIdSchema` (Task 1), `getDict` (`src/i18n/server.ts`).
- Produces: the `/chat/[chatId]` route.

- [ ] **Step 1: Create the page**

Create `app/chat/[chatId]/page.tsx`:

```tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ChatShell } from "@/src/components/chat/chat-shell"
import { getDict } from "@/src/i18n/server"
import { chatIdSchema } from "@/src/lib/chat-schemas"

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict()
  return {
    title: dict.meta.chat.title,
    description: dict.meta.chat.description,
    robots: { index: false },
  }
}

export default async function ChatByIdPage({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  const { chatId } = await params
  if (!chatIdSchema.safeParse(chatId).success) notFound()

  return <ChatShell initialChatId={chatId} />
}
```

- [ ] **Step 2: Verify types**

Run: `bunx tsc --noEmit`
Expected: no new errors (this is the last consumer of `ChatShellProps.initialChatId`, which already exists from Task 13).

- [ ] **Step 3: Manual verification**

Run: `bun dev`, then in the browser:
- Visit `http://localhost:3000/chat/not-a-uuid` → expect Next.js's 404 page.
- Visit `http://localhost:3000/chat/00000000-0000-0000-0000-000000000000` (syntactically valid, non-existent) while logged in → expect the chat page to load and then (once Task 15 lands) redirect back to `/chat` with a toast, since the backend will 404 on the messages fetch. Before Task 15 lands, it will just show an empty chat — that's fine at this point in the plan.

- [ ] **Step 4: Commit**

```bash
git add "app/chat/[chatId]/page.tsx"
git commit -m "feat: add /chat/[chatId] dynamic route"
```

---

### Task 15: Load chat history into `ChatView`

**Files:**
- Modify: `src/components/chat/chat-view.tsx`

**Interfaces:**
- Consumes: `mapHistoryMessage`, `parseHistoryResponse` (Task 8); `GET /api/chat/[chatId]/messages` (Task 3).
- Produces: `ChatViewProps` gains `initialChatId: string | null`; `MessageList` receives new `hasMoreOlder`/`onLoadOlder` props (defined here, implemented in Task 16).

- [ ] **Step 1: Update `ChatView`**

Replace the full contents of `src/components/chat/chat-view.tsx` with:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useI18n } from "@/src/i18n/client";
import { mapHistoryMessage, parseHistoryResponse } from "./chat-history-mapping";
import { ChatInput } from "./chat-input";
import { GeoWarningBanner } from "./geo-warning-banner";
import { MessageList } from "./message-list";
import type { ChatMessage } from "./types";
import { useChatGeo } from "./use-chat-geo";

interface MessageResponse {
  chatId: string;
  answer: string;
}

function parseMessageResponse(data: unknown): MessageResponse | null {
  if (
    data !== null &&
    typeof data === "object" &&
    "chatId" in data &&
    typeof data.chatId === "string" &&
    "answer" in data &&
    typeof data.answer === "string"
  ) {
    return { chatId: data.chatId, answer: data.answer };
  }
  return null;
}

function readErrorMessage(data: unknown): string | null {
  if (
    data !== null &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }
  return null;
}

interface ChatViewProps {
  hasProfileLocation: boolean;
  initialChatId: string | null;
}

export function ChatView({ hasProfileLocation, initialChatId }: ChatViewProps) {
  const router = useRouter();
  const { dict: ru } = useI18n();
  const { status: geoStatus, getCoords } = useChatGeo();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const chatIdRef = useRef<string | null>(initialChatId);
  const oldestCreatedAtRef = useRef<string | null>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);

  useEffect(() => {
    if (!initialChatId) return;
    let cancelled = false;

    fetch(`/api/chat/${initialChatId}/messages?limit=50`)
      .then(async (res) => {
        const data: unknown = await res.json().catch(() => null);
        if (cancelled) return;

        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) {
          toast.error(
            res.status === 403
              ? ru.chat.history.errors.noAccess
              : ru.chat.history.errors.notFound,
          );
          router.push("/chat");
          return;
        }

        const parsed = parseHistoryResponse(data);
        if (!parsed) {
          toast.error(ru.auth.errors.unexpectedResponse);
          router.push("/chat");
          return;
        }

        setMessages(parsed.messages.flatMap(mapHistoryMessage));
        setHasMoreOlder(parsed.has_more);
        oldestCreatedAtRef.current = parsed.messages.at(0)?.created_at ?? null;
      })
      .catch(() => {
        if (!cancelled) {
          toast.error(ru.auth.errors.network);
          router.push("/chat");
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialChatId]);

  const loadOlderMessages = async () => {
    if (!chatIdRef.current || !hasMoreOlder || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const before = oldestCreatedAtRef.current
        ? `&before=${encodeURIComponent(oldestCreatedAtRef.current)}`
        : "";
      const res = await fetch(
        `/api/chat/${chatIdRef.current}/messages?limit=50${before}`,
      );
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) return;

      const parsed = parseHistoryResponse(data);
      if (!parsed) return;

      const mapped = parsed.messages.flatMap(mapHistoryMessage);
      setMessages((prev) => [...mapped, ...prev]);
      setHasMoreOlder(parsed.has_more);
      oldestCreatedAtRef.current =
        parsed.messages.at(0)?.created_at ?? oldestCreatedAtRef.current;
    } finally {
      setLoadingOlder(false);
    }
  };

  const pushMessage = (message: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), ...message }]);
  };

  const send = async (text: string, image?: File) => {
    const trimmed = text.trim();
    if (pending || (!trimmed && !image)) return;

    let imageUrl: string | undefined;
    if (image) {
      imageUrl = URL.createObjectURL(image);
      objectUrlsRef.current.push(imageUrl);
    }
    pushMessage({
      role: "user",
      text: trimmed,
      imageUrl,
      imageName: image?.name,
    });
    setPending(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const coords = await getCoords();

      const form = new FormData();
      if (chatIdRef.current) form.set("chatId", chatIdRef.current);
      if (trimmed) form.set("text", trimmed);
      if (image) form.set("image", image);
      if (coords) {
        form.set("latitude", String(coords.latitude));
        form.set("longitude", String(coords.longitude));
      }

      const res = await fetch("/api/chat/message", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      const data: unknown = await res.json().catch(() => null);

      if (!res.ok && res.status === 401) {
        router.push("/login");
        router.refresh();
        return;
      }

      if (!res.ok) {
        pushMessage({
          role: "bot",
          text: readErrorMessage(data) ?? ru.chat.errors.failed,
        });
        return;
      }

      const parsed = parseMessageResponse(data);
      if (!parsed) {
        pushMessage({ role: "bot", text: ru.auth.errors.unexpectedResponse });
        return;
      }
      chatIdRef.current = parsed.chatId;
      pushMessage({ role: "bot", text: parsed.answer });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      pushMessage({ role: "bot", text: ru.auth.errors.network });
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setPending(false);
      }
    }
  };

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[880px] flex-1 flex-col overflow-hidden">
      {geoStatus === "denied" && !hasProfileLocation && <GeoWarningBanner />}

      <MessageList
        messages={messages}
        pending={pending}
        hasMoreOlder={hasMoreOlder}
        onLoadOlder={() => void loadOlderMessages()}
      />

      <ChatInput
        pending={pending}
        onSend={(text, image) => void send(text, image)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `bunx tsc --noEmit`
Expected: an error at `MessageList`'s call site (`hasMoreOlder`/`onLoadOlder` props don't exist yet) — expected, fixed in Task 16. No other new errors (this resolves the `ChatView` prop error from Task 13).

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/chat-view.tsx
git commit -m "feat: load existing chat history into ChatView on open"
```

---

### Task 16: Scroll-up pagination in `MessageList`

**Files:**
- Modify: `src/components/chat/message-list.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `MessageListProps` gains `hasMoreOlder?: boolean` and `onLoadOlder?: () => void`.

- [ ] **Step 1: Add the new props and scroll handling**

In `src/components/chat/message-list.tsx`, update the props interface and the scroll-position effect:

```tsx
interface MessageListProps {
  messages: ChatMessage[];
  pending: boolean;
  hasMoreOlder?: boolean;
  onLoadOlder?: () => void;
}

export function MessageList({
  messages,
  pending,
  hasMoreOlder = false,
  onLoadOlder,
}: MessageListProps) {
  const { dict } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const prevScrollHeightRef = useRef<number | null>(null);
  const prevMessageCountRef = useRef(messages.length);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const grew = messages.length > prevMessageCountRef.current;
    if (grew && prevScrollHeightRef.current !== null) {
      element.scrollTop = element.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = null;
    } else {
      element.scrollTop = element.scrollHeight;
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, pending]);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element || !hasMoreOlder || !onLoadOlder) return;
    if (element.scrollTop < 80) {
      prevScrollHeightRef.current = element.scrollHeight;
      onLoadOlder();
    }
  };
```

Update the scrollable container's opening tag to wire up the handler (it already has `ref={scrollRef}` and the `chat-dot-grid` class list — just add `onScroll`):

```tsx
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        aria-live="polite"
        className={`chat-dot-grid relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 [webkit-overflow-scrolling:touch] sm:p-6 ${
          isEmpty ? "items-center" : ""
        }`}
      >
```

Leave the rest of the file (message rendering, image lightbox) untouched.

- [ ] **Step 2: Verify types**

Run: `bunx tsc --noEmit`
Expected: clean — this resolves the last error introduced by Task 15.

- [ ] **Step 3: Manual verification**

Run: `bun dev`. Open a chat with more than 50 stored messages (or temporarily lower the route handler's `limit` to `5` for this check, then revert), scroll to the top of the message list, and confirm older messages load in without the visible content jumping under the cursor.

- [ ] **Step 4: Commit**

```bash
git add src/components/chat/message-list.tsx
git commit -m "feat: load older chat messages on scroll-to-top"
```

---

### Task 17: Whole-feature verification

**Files:** none (verification only).

- [ ] **Step 1: Full type check, lint, unit tests, and build**

Run: `bunx tsc --noEmit && bun run lint && bun test && bun run build`
Expected: all four succeed with no errors.

- [ ] **Step 2: Manual smoke test against the live backend** (`http://167.233.203.129`, per `.env.local`'s `API_URL`)

Run `bun dev` and, logged in as a real user with at least one existing chat:
- `/chat` shows "Новый чат" plus the history panel with at least one chat grouped under a date heading.
- Clicking a past chat navigates to `/chat/<id>`, loads its messages (mapped user/bot pairs render correctly, including any image-only turns), and a page reload on that URL reloads the same chat.
- Hovering a chat item reveals rename/delete icons; renaming updates the title in place; pressing Escape while editing cancels without a request.
- Clicking delete opens the confirm popover; confirming removes the chat from the list and, if it was the open chat, navigates back to `/chat`.
- Clicking "Корзина" switches to the trash view (empty state if nothing deleted yet); after deleting a chat, it appears there with a restore action; restoring moves it back to the main list.
- Scrolling to the top of a long chat loads older messages without a visible content jump.
- Collapsing the desktop sidebar to its 72px icon rail hides the history panel entirely (no overflow/clipping).
- Test in `ru`, `en`, and `ky` locales — every new string renders (no raw key names like `chat.history.today` visible anywhere).

- [ ] **Step 3: Report results**

If every check in Step 2 passes, the feature is complete — no commit needed for this task (verification only). If anything fails, return to the owning task above, fix it, and re-run Step 1 before continuing.
