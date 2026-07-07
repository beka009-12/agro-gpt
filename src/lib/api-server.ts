import ru from "@/src/i18n/ru.json"

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<unknown> {
  const baseUrl = process.env.API_URL
  if (!baseUrl) {
    console.error("[api-server] env API_URL is not set")
    throw new ApiError(ru.auth.errors.unavailable, 502)
  }

  let res: Response
  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    })
  } catch (error) {
    console.error(`[api-server] network error for ${path}:`, error)
    throw new ApiError(ru.auth.errors.unavailable, 502)
  }

  if (!res.ok) {
    let detail: string | undefined
    try {
      const body: unknown = await res.json()
      if (
        body !== null &&
        typeof body === "object" &&
        "detail" in body &&
        typeof body.detail === "string"
      ) {
        detail = body.detail
      }
    } catch {
      // тело не JSON — оставляем detail пустым
    }
    console.error(
      `[api-server] ${init?.method ?? "GET"} ${path} -> ${res.status}`,
      detail ?? ""
    )
    if (res.status === 422) throw new ApiError(ru.auth.errors.checkData, 422)
    if (res.status >= 500) throw new ApiError(ru.auth.errors.unavailable, 502)
    throw new ApiError(detail ?? ru.auth.errors.checkData, res.status)
  }

  try {
    return await res.json()
  } catch {
    return null
  }
}
