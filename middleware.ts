import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/auth-session'
import { debugAgentLog } from '@/lib/debug-agent-log'

const protectedPrefixes = ['/dashboard', '/admin', '/super-admin']
const authPaths = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME)
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))
  const isAuthPage = authPaths.some((path) => pathname === path)

  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    // #region agent log
    debugAgentLog(
      'middleware.ts',
      'unauthenticated protected route redirect',
      { pathname, redirectTo: loginUrl.pathname + loginUrl.search },
      'B',
    )
    // #endregion
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && hasSession) {
    const redirectTarget = '/dashboard'
    // #region agent log
    debugAgentLog(
      'middleware.ts',
      'authenticated auth-page redirect',
      { pathname, hasSession, redirectTarget },
      'A',
    )
    // #endregion
    return NextResponse.redirect(new URL(redirectTarget, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/super-admin/:path*',
    '/login',
    '/register',
  ],
}
