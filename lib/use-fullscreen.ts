"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  enterFullscreen,
  enterNativeVideoFullscreen,
  exitFullscreen,
  exitNativeVideoFullscreen,
  getFullscreenElement,
  isIosSafari,
  isTouchMobile,
  isVideoNativeFullscreen,
  lockLandscapeOrientation,
  unlockScreenOrientation,
} from "@/lib/video-fullscreen"

interface UseFullscreenOptions {
  /** iOS Safari: use native `<video>` fullscreen (auto-rotates to landscape). */
  nativeVideo?: HTMLVideoElement | null
  /** Lock screen to landscape while in element fullscreen on touch devices. */
  lockLandscape?: boolean
}

export function useFullscreen<T extends HTMLElement>(options: UseFullscreenOptions = {}) {
  const { nativeVideo, lockLandscape = true } = options
  const [node, setNode] = useState<T | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false)
  const nativeFsActive = useRef(false)

  const ref = useCallback((el: T | null) => {
    setNode(el)
  }, [])

  const syncElementFullscreen = useCallback(() => {
    if (nativeFsActive.current) return
    const active = getFullscreenElement() === node
    setIsFullscreen(active || pseudoFullscreen)
    if (!active && !pseudoFullscreen) unlockScreenOrientation()
  }, [node, pseudoFullscreen])

  useEffect(() => {
    document.addEventListener("fullscreenchange", syncElementFullscreen)
    document.addEventListener("webkitfullscreenchange", syncElementFullscreen)
    return () => {
      document.removeEventListener("fullscreenchange", syncElementFullscreen)
      document.removeEventListener("webkitfullscreenchange", syncElementFullscreen)
    }
  }, [syncElementFullscreen])

  useEffect(() => {
    const video = nativeVideo
    if (!video) return

    const onBegin = () => {
      nativeFsActive.current = true
      setIsFullscreen(true)
    }
    const onEnd = () => {
      nativeFsActive.current = false
      setIsFullscreen(false)
      unlockScreenOrientation()
    }

    video.addEventListener("webkitbeginfullscreen", onBegin)
    video.addEventListener("webkitendfullscreen", onEnd)
    return () => {
      video.removeEventListener("webkitbeginfullscreen", onBegin)
      video.removeEventListener("webkitendfullscreen", onEnd)
    }
  }, [nativeVideo])

  useEffect(() => {
    return () => unlockScreenOrientation()
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (!node) return

    const video = nativeVideo
    const inNativeFs = isVideoNativeFullscreen(video)
    const inElementFs = getFullscreenElement() === node

    if (inNativeFs || inElementFs || pseudoFullscreen) {
      if (inNativeFs && video) {
        exitNativeVideoFullscreen(video)
      } else if (inElementFs) {
        await exitFullscreen()
      }
      setPseudoFullscreen(false)
      unlockScreenOrientation()
      setIsFullscreen(false)
      return
    }

    if (isIosSafari() && video) {
      enterNativeVideoFullscreen(video)
      return
    }

    try {
      await enterFullscreen(node)
      if (lockLandscape && isTouchMobile()) {
        await lockLandscapeOrientation()
      }
      setPseudoFullscreen(false)
      setIsFullscreen(true)
    } catch {
      if (lockLandscape && isTouchMobile()) {
        setPseudoFullscreen(true)
        await lockLandscapeOrientation()
        setIsFullscreen(true)
      }
    }
  }, [node, nativeVideo, lockLandscape, pseudoFullscreen])

  return { ref, element: node, isFullscreen, pseudoFullscreen, toggleFullscreen }
}
