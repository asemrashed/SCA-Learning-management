import type { Role } from '@/types/api'

/** Client-readable flag so Next.js middleware can gate protected routes (token stays in Redux memory). */
export const SESSION_COOKIE_NAME = 'sca_session'
export const ROLE_COOKIE_NAME = 'sca_role'
/** Staff opted into student dashboard preview via sidebar (not URL bar). */
export const STUDENT_VIEW_COOKIE_NAME = 'sca_student_view'

const cookieMaxAge = 60 * 60 * 24 * 7

export function setSessionCookie(role?: Role): void {
  if (typeof document === 'undefined') return
  document.cookie = `${SESSION_COOKIE_NAME}=1; path=/; max-age=${cookieMaxAge}; SameSite=Lax`
  if (role) {
    document.cookie = `${ROLE_COOKIE_NAME}=${role}; path=/; max-age=${cookieMaxAge}; SameSite=Lax`
  }
}

export function clearSessionCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
  document.cookie = `${ROLE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
  document.cookie = `${STUDENT_VIEW_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
}

export function hasSessionCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${SESSION_COOKIE_NAME}=`))
}
