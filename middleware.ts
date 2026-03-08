import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function unauthorizedResponse() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area", charset="UTF-8"',
    },
  })
}

function decodeBasicAuth(header: string) {
  const [scheme, encoded] = header.split(" ")
  if (scheme !== "Basic" || !encoded) {
    return null
  }

  try {
    const decoded = atob(encoded)
    const separatorIndex = decoded.indexOf(":")
    if (separatorIndex < 0) {
      return null
    }

    const username = decoded.slice(0, separatorIndex)
    const password = decoded.slice(separatorIndex + 1)
    return { username, password }
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const expectedUser = process.env.ADMIN_BASIC_AUTH_USER
  const expectedPass = process.env.ADMIN_BASIC_AUTH_PASS

  if (!expectedUser || !expectedPass) {
    return new NextResponse("Admin auth is not configured", { status: 500 })
  }

  const authHeader = request.headers.get("authorization")
  if (!authHeader) {
    return unauthorizedResponse()
  }

  const credentials = decodeBasicAuth(authHeader)
  if (!credentials) {
    return unauthorizedResponse()
  }

  const isValid =
    credentials.username === expectedUser &&
    credentials.password === expectedPass

  if (!isValid) {
    return unauthorizedResponse()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/programmatic", "/admin/programmatic/:path*"],
}
