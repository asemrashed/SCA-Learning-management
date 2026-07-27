import type { Role } from '@/types/api'

/** Client-readable flag so Next.js middleware can gate protected routes (token stays in Redux memory). */
export const SESSION_COOKIE_NAME = 'sca_session'
export const ROLE_COOKIE_NAME = 'sca_role'
/** Marks a persistent ("remember me") login so bootstrap can re-apply matching cookie lifetimes. */
export const REMEMBER_COOKIE_NAME = 'sca_remember'

/** Matches server `JWT_REFRESH_EXPIRES_IN` default (7d). */
const REMEMBER_MAX_AGE_SEC = 60 * 60 * 24 * 7

export type SessionCookieOptions = {
  /** When true, cookies survive browser restarts for REMEMBER_MAX_AGE_SEC. */
  remember?: boolean
}

function writeCookie(name: string, value: string, remember: boolean): void {
  const base = `${name}=${value}; path=/; SameSite=Lax`
  document.cookie = remember ? `${base}; max-age=${REMEMBER_MAX_AGE_SEC}` : base
}

export function setSessionCookie(role?: Role, options?: SessionCookieOptions): void {
  if (typeof document === 'undefined') return
  const remember = options?.remember === true
  writeCookie(SESSION_COOKIE_NAME, '1', remember)
  if (role) {
    writeCookie(ROLE_COOKIE_NAME, role, remember)
  }
  if (remember) {
    writeCookie(REMEMBER_COOKIE_NAME, '1', true)
  } else {
    document.cookie = `${REMEMBER_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
  }
}

export function clearSessionCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
  document.cookie = `${ROLE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
  document.cookie = `${REMEMBER_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
  // Clear legacy preview cookie from earlier builds
  document.cookie = 'sca_student_view=; path=/; max-age=0; SameSite=Lax'
}

export function hasSessionCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${SESSION_COOKIE_NAME}=`))
}

export function hasRememberCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${REMEMBER_COOKIE_NAME}=`))
}
