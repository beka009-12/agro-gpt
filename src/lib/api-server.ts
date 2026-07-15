import ru from "@/src/i18n/ru.json"

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors?: Record<string, string>

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface ValidationErrorItem {
  loc: (string | number)[]
  msg: string
}

function parseFieldErrors(detail: unknown): Record<string, string> | undefined {
  if (!Array.isArray(detail)) return undefined
  const fields: Record<string, string> = {}
  for (const item of detail as ValidationErrorItem[]) {
    if (
      item === null ||
      typeof item !== "object" ||
      !Array.isArray(item.loc) ||
      typeof item.msg !== "string"
    ) {
      continue
    }
    const field = item.loc[item.loc.length - 1]
    if (typeof field === "string") fields[field] = item.msg
  }
  return Object.keys(fields).length > 0 ? fields : undefined
}

export interface ApiMessages {
  unavailable: string
  checkData: string
}

// fallback на русский — для вызовов без словаря (logout)
const DEFAULT_MESSAGES: ApiMessages = {
  unavailable: ru.auth.errors.unavailable,
  checkData: ru.auth.errors.checkData,
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
  msgs?: ApiMessages
): Promise<unknown> {
  const m = msgs ?? DEFAULT_MESSAGES
  const baseUrl = process.env.API_URL
  if (!baseUrl) {
    console.error("[api-server] env API_URL is not set")
    throw new ApiError(m.unavailable, 502)
  }

  let res: Response
  try {
    // для FormData Content-Type ставит fetch (boundary), вручную нельзя
    const isFormData = init?.body instanceof FormData
    res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: isFormData
        ? init?.headers
        : { "Content-Type": "application/json", ...init?.headers },
    })
  } catch (error) {
    console.error(`[api-server] network error for ${path}:`, error)
    throw new ApiError(m.unavailable, 502)
  }

  if (!res.ok) {
    let detail: string | undefined
    let fieldErrors: Record<string, string> | undefined
    try {
      const body: unknown = await res.json()
      if (body !== null && typeof body === "object" && "detail" in body) {
        if (typeof body.detail === "string") {
          detail = body.detail
        } else {
          fieldErrors = parseFieldErrors(body.detail)
        }
      }
    } catch {
      // тело не JSON — оставляем detail пустым
    }
    console.error(
      `[api-server] ${init?.method ?? "GET"} ${path} -> ${res.status}`,
      detail ?? fieldErrors ?? ""
    )
    if (res.status === 422) throw new ApiError(m.checkData, 422, fieldErrors)
    if (res.status >= 500) throw new ApiError(m.unavailable, 502)
    throw new ApiError(detail ?? m.checkData, res.status)
  }

  try {
    return await res.json()
  } catch {
    return null
  }
}
