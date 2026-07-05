"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { useLogoutMutation } from "@/features/auth/api"
import { clearCredentials } from "@/features/auth/authSlice"
import { clearSessionCookie } from "@/lib/auth-session"

export const FOCUS_LOSS_SIGNOUT_THRESHOLD = 3

export function usePdfCaptureGuard(enabled: boolean) {
  const router = useRouter()
  const dispatch = useDispatch()
  const [logout] = useLogoutMutation()
  const [contentHidden, setContentHidden] = useState(false)
  const [focusLossCount, setFocusLossCount] = useState(0)
  const lossCountedRef = useRef(false)
  const signingOutRef = useRef(false)

  const signOut = useCallback(async () => {
    if (signingOutRef.current) return
    signingOutRef.current = true
    try {
      await logout().unwrap()
    } catch {
      // Clear local session even if API fails
    }
    dispatch(clearCredentials())
    clearSessionCookie()
    router.push("/login")
    router.refresh()
  }, [dispatch, logout, router])

  const handleFocusLoss = useCallback(() => {
    setContentHidden(true)
    if (lossCountedRef.current) return
    lossCountedRef.current = true
    setFocusLossCount((count) => {
      const next = count + 1
      if (next >= FOCUS_LOSS_SIGNOUT_THRESHOLD) {
        void signOut()
      }
      return next
    })
  }, [signOut])

  const handleFocusGain = useCallback(() => {
    setContentHidden(false)
    lossCountedRef.current = false
  }, [])

  useEffect(() => {
    if (!enabled) {
      setContentHidden(false)
      return
    }

    function onVisibilityChange() {
      if (document.hidden) handleFocusLoss()
      else handleFocusGain()
    }

    function onWindowBlur() {
      if (!document.hidden) handleFocusLoss()
    }

    function onWindowFocus() {
      if (!document.hidden) handleFocusGain()
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    window.addEventListener("blur", onWindowBlur)
    window.addEventListener("focus", onWindowFocus)
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("blur", onWindowBlur)
      window.removeEventListener("focus", onWindowFocus)
    }
  }, [enabled, handleFocusGain, handleFocusLoss])

  return {
    contentHidden,
    focusLossCount,
    focusLossThreshold: FOCUS_LOSS_SIGNOUT_THRESHOLD,
  }
}
