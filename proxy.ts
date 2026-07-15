import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"

const GUEST_ONLY_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]

export function proxy(request: NextRequest): NextResponse {
  const hasToken = request.cookies.has(TOKEN_COOKIE)
  const { pathname } = request.nextUrl

  if (!hasToken && pathname === "/chat") {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (hasToken && GUEST_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/chat", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/chat", "/login", "/register", "/forgot-password", "/reset-password"],
}
