import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROLE_COOKIE_NAME, SESSION_COOKIE_NAME } from '@/lib/auth-session'
import { homePathForRole } from '@/lib/dashboard-nav'
import { Role } from '@/types/api'

const protectedPrefixes = ['/dashboard', '/admin', '/super-admin']
const authPaths = ['/login', '/register']

function roleFromCookie(request: NextRequest): Role | null {
  const raw = request.cookies.get(ROLE_COOKIE_NAME)?.value
  if (raw === Role.STUDENT || raw === Role.ADMIN || raw === Role.SUPER_ADMIN) return raw
  return null
}

function isStaffRole(role: Role | null): role is Role.ADMIN | Role.SUPER_ADMIN {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME)
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))
  const isAuthPage = authPaths.some((path) => pathname === path)

  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (hasSession && pathname.startsWith('/dashboard')) {
    const role = roleFromCookie(request)
    if (isStaffRole(role)) {
      return NextResponse.redirect(new URL(homePathForRole(role), request.url))
    }
  }

  if (isAuthPage && hasSession) {
    const role = roleFromCookie(request)
    if (!role) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL(homePathForRole(role), request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/admin/:path*',
    '/super-admin/:path*',
    '/login',
    '/register',
  ],
}
