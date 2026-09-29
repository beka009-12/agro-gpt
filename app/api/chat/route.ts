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
