'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { hasSessionCookie } from '@/lib/auth-session'
import { homePathForRole } from '@/lib/dashboard-nav'
import { debugAgentLog } from '@/lib/debug-agent-log'

/** Redirects already-authenticated users away from /login and /register. */
export function AuthSessionRedirect() {
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)
  const authReady = useSelector((state: RootState) => state.auth.authReady)

  useEffect(() => {
    if (!authReady || !hasSessionCookie() || !user) return

    const target = homePathForRole(user.role)
    // #region agent log
    debugAgentLog(
      'auth-session-redirect.tsx',
      'authenticated auth page client redirect',
      { userRole: user.role, target },
      'A',
      'post-fix',
    )
    // #endregion
    router.replace(target)
  }, [authReady, user, router])

  return null
}
