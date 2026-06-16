'use client'

import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { setCredentials, clearCredentials, setAuthReady } from '@/features/auth/authSlice'
import { clearSessionCookie, hasSessionCookie } from '@/lib/auth-session'
import { markAuthReady } from '@/lib/auth-ready'
import { bootstrapRefreshSession } from '@/lib/apiClient'
import type { AppDispatch } from '@/store'

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
      finish()
      return
    }

    bootstrapRefreshSession()
      .then((result) => {
        if (result) {
          dispatch(
            setCredentials({
              accessToken: result.data.accessToken,
              user: result.data.user,
            }),
          )
        } else {
          dispatch(clearCredentials())
          clearSessionCookie()
        }
      })
      .catch(() => {
        dispatch(clearCredentials())
        clearSessionCookie()
      })
      .finally(finish)
  }, [dispatch])

  return null
}
