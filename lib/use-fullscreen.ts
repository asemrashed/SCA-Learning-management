"use client"

import { useCallback, useEffect, useState } from "react"

export function useFullscreen<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const ref = useCallback((el: T | null) => {
    setNode(el)
  }, [])

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(document.fullscreenElement === node)
    }
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [node])

  const toggleFullscreen = useCallback(async () => {
    if (!node) return
    try {
      if (document.fullscreenElement === node) {
        await document.exitFullscreen()
      } else {
        await node.requestFullscreen()
      }
    } catch {
      /* unsupported or denied */
    }
  }, [node])

  return { ref, element: node, isFullscreen, toggleFullscreen }
}
