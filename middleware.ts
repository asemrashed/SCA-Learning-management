import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROLE_COOKIE_NAME, SESSION_COOKIE_NAME } from '@/lib/auth-session'
import { homePathForRole } from '@/lib/dashboard-nav'
import { debugAgentLog } from '@/lib/debug-agent-log'
import { Role } from '@/types/api'

const protectedPrefixes = ['/dashboard', '/admin', '/super-admin']
const authPaths = ['/login', '/register']

function roleFromCookie(request: NextRequest): Role | null {
  const raw = request.cookies.get(ROLE_COOKIE_NAME)?.value
  if (raw === Role.STUDENT || raw === Role.ADMIN || raw === Role.SUPER_ADMIN) return raw
  return null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME)
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))
  const isAuthPage = authPaths.some((path) => pathname === path)

  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    // #region agent log
    console.log(
      '[DEBUG-1a583d]',
      JSON.stringify({
        sessionId: '1a583d',
        location: 'middleware.ts',
        message: 'unauthenticated protected route redirect',
        data: { pathname, redirectTo: loginUrl.pathname + loginUrl.search },
        hypothesisId: 'B',
        runId: 'post-fix',
        timestamp: Date.now(),
      }),
    )
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
    const role = roleFromCookie(request)
    if (!role) {
      // #region agent log
      console.log(
        '[DEBUG-1a583d]',
        JSON.stringify({
          sessionId: '1a583d',
          location: 'middleware.ts',
          message: 'auth page with session but no role cookie — pass through',
          data: { pathname, hasSession },
          hypothesisId: 'A',
          runId: 'post-fix',
          timestamp: Date.now(),
        }),
      )
      // #endregion
      return NextResponse.next()
    }
    const redirectTarget = homePathForRole(role)
    // #region agent log
    console.log(
      '[DEBUG-1a583d]',
      JSON.stringify({
        sessionId: '1a583d',
        location: 'middleware.ts',
        message: 'authenticated auth-page redirect',
        data: { pathname, hasSession, role, redirectTarget },
        hypothesisId: 'A',
        runId: 'post-fix',
        timestamp: Date.now(),
      }),
    )
    debugAgentLog(
      'middleware.ts',
      'authenticated auth-page redirect',
      { pathname, hasSession, role, redirectTarget },
      'A',
      'post-fix',
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
