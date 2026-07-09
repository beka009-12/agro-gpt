import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import ru from "@/src/i18n/ru.json"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import { clearAuthCookies, TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import {
  chatCreateResponseSchema,
  chatIdSchema,
  diagnosisResponseSchema,
} from "@/src/lib/chat-schemas"

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_TEXT_LENGTH = 4000

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const store = await cookies()
    const token = store.get(TOKEN_COOKIE)?.value
    if (!token) {
      return NextResponse.json(
        { message: ru.auth.errors.unauthorized },
        { status: 401 }
      )
    }
    const authHeaders = { Authorization: `Bearer ${token}` }

    const form = await request.formData().catch(() => null)
    if (!form) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    const text = form.get("text")
    const image = form.get("image")
    const chatIdRaw = form.get("chatId")
    const trimmedText = typeof text === "string" ? text.trim() : ""
    const hasImage = image instanceof File && image.size > 0
    if (!trimmedText && !hasImage) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }
    if (image instanceof File && image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { message: ru.chat.errors.imageTooLarge },
        { status: 413 }
      )
    }
    if (hasImage && !image.type.startsWith("image/")) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }
    if (trimmedText.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    const parsedChatId = chatIdSchema.safeParse(chatIdRaw)
    let chatId = parsedChatId.success ? parsedChatId.data : null
    if (!chatId) {
      const created = await apiFetch("/chat/", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({}),
      })
      const parsed = chatCreateResponseSchema.safeParse(created)
      if (!parsed.success) {
        console.error("[chat/message] unexpected create-chat response:", created)
        return NextResponse.json(
          { message: ru.auth.errors.unexpectedResponse },
          { status: 502 }
        )
      }
      chatId = parsed.data.id
    }

    const backendForm = new FormData()
    backendForm.set("chat_id", chatId)
    if (trimmedText) backendForm.set("user_text", trimmedText)
    if (hasImage) backendForm.set("user_image", image)

    const data = await apiFetch("/diagnosis/", {
      method: "POST",
      headers: authHeaders,
      body: backendForm,
    })
    const diagnosis = diagnosisResponseSchema.safeParse(data)
    if (!diagnosis.success) {
      console.error("[chat/message] unexpected diagnosis response:", data)
      return NextResponse.json(
        { message: ru.auth.errors.unexpectedResponse },
        { status: 502 }
      )
    }

    return NextResponse.json({ chatId, answer: diagnosis.data.answer })
  } catch (error) {
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
        { message: error.message },
        { status: error.status }
      )
    }
    console.error("[chat/message]", error)
    return NextResponse.json(
      { message: ru.auth.errors.unavailable },
      { status: 500 }
    )
  }
}
