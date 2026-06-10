'use client'

import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useRefreshMutation } from '@/features/auth/api'
import { setCredentials, clearCredentials } from '@/features/auth/authSlice'
import { clearSessionCookie, hasSessionCookie } from '@/lib/auth-session'
import type { AppDispatch } from '@/store'

export function AuthBootstrap() {
  const dispatch = useDispatch<AppDispatch>()
  const [refresh] = useRefreshMutation()
  const bootstrapped = useRef(false)

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true

    if (!hasSessionCookie()) return

    refresh()
      .unwrap()
      .then((result) => {
        dispatch(
          setCredentials({
            accessToken: result.data.accessToken,
            user: result.data.user,
          }),
        )
      })
      .catch(() => {
        dispatch(clearCredentials())
        clearSessionCookie()
      })
  }, [dispatch, refresh])

  return null
}
