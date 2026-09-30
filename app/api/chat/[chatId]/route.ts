import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDict } from "@/src/i18n/server"
import { apiFetch } from "@/src/lib/api-server"
import { handleApiError } from "@/src/lib/api-route-helpers"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import { chatIdSchema, chatRenameFormSchema } from "@/src/lib/chat-schemas"

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
