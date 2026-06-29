'use client'

import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { setCredentials, clearCredentials, setAuthReady } from '@/features/auth/authSlice'
import { clearSessionCookie, hasSessionCookie } from '@/lib/auth-session'
import { markAuthReady } from '@/lib/auth-ready'
import { bootstrapRefreshSession } from '@/lib/apiClient'
import type { AppDispatch } from '@/store'
import { debugAgentLog } from '@/lib/debug-agent-log'

export function AuthBootstrap() {
  const dispatch = useDispatch<AppDispatch>()
  const bootstrapped = useRef(false)

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true

    const finish = () => {
      dispatch(setAuthReady())
      markAuthReady()
    }

    if (!hasSessionCookie()) {
      // #region agent log
      debugAgentLog('auth-bootstrap.tsx', 'no session cookie', {}, 'E')
      // #endregion
      finish()
      return
    }

    bootstrapRefreshSession()
      .then((result) => {
        // #region agent log
        debugAgentLog(
          'auth-bootstrap.tsx',
          'bootstrap refresh result',
          {
            status: result.status,
            role: result.status === 'ok' ? result.data.user.role : null,
          },
          'E',
        )
        // #endregion
        if (result.status === 'ok') {
          dispatch(
            setCredentials({
              accessToken: result.data.accessToken,
              user: result.data.user,
            }),
          )
        } else if (result.status === 'unauthorized') {
          dispatch(clearCredentials())
          clearSessionCookie()
        }
      })
      .finally(finish)
  }, [dispatch])

  return null
}
