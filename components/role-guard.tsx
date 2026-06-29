'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { Role } from '@/types/api'
import { homePathForRole } from '@/lib/dashboard-nav'
import { debugAgentLog } from '@/lib/debug-agent-log'

interface RoleGuardProps {
  allow: Role[]
  children: React.ReactNode
}

export function RoleGuard({ allow, children }: RoleGuardProps) {
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)
  const accessToken = useSelector((state: RootState) => state.auth.accessToken)
  const authReady = useSelector((state: RootState) => state.auth.authReady)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!authReady) return

    if (!user && !accessToken) {
      router.replace('/login')
      return
    }

    if (!user) return

    if (!allow.includes(user.role)) {
      const redirectTo = homePathForRole(user.role)
      // #region agent log
      debugAgentLog(
        'role-guard.tsx',
        'role mismatch redirect',
        { userRole: user.role, allowedRoles: allow, redirectTo },
        'F',
      )
      // #endregion
      router.replace(redirectTo)
      return
    }

    // #region agent log
    debugAgentLog(
      'role-guard.tsx',
      'access granted',
      { userRole: user.role, allowedRoles: allow },
      'F',
    )
    // #endregion
    setReady(true)
  }, [authReady, accessToken, user, allow, router])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Checking access…
      </div>
    )
  }

  return <>{children}</>
}
