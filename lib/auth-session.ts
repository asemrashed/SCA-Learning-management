/** Client-readable flag so Next.js middleware can gate protected routes (token stays in Redux memory). */
export const SESSION_COOKIE_NAME = 'sca_session'

export function setSessionCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${SESSION_COOKIE_NAME}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

export function clearSessionCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
}

export function hasSessionCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${SESSION_COOKIE_NAME}=`))
}
