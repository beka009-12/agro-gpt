import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDict } from "@/src/i18n/server"
import { apiFetch } from "@/src/lib/api-server"
import { handleApiError } from "@/src/lib/api-route-helpers"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import { chatIdSchema } from "@/src/lib/chat-schemas"

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
