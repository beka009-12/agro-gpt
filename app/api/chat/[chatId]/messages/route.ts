import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDict } from "@/src/i18n/server"
import { apiFetch } from "@/src/lib/api-server"
import { handleApiError } from "@/src/lib/api-route-helpers"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import { chatIdSchema, chatMessagesResponseSchema } from "@/src/lib/chat-schemas"

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
    if (!chatIdSchema.safeParse(chatId).success) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 404 }
      )
    }
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
