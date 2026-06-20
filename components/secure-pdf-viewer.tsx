"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, Maximize2, Minimize2, X, ZoomIn, ZoomOut } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"
import { Button } from "@/components/ui/button"
import { fetchResourceStream } from "@/lib/fetch-resource-stream"
import { renderPdfToCanvases } from "@/lib/load-pdfjs"
import { cn } from "@/lib/utils"

interface SecurePdfViewerProps {
  resourceId: string
  title: string
  onClose?: () => void
  className?: string
}

export function SecurePdfViewer({
  resourceId,
  title,
  onClose,
  className,
}: SecurePdfViewerProps) {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken)
  const user = useSelector((state: RootState) => state.auth.user)
  const shellRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<HTMLDivElement>(null)
  const pdfDataRef = useRef<ArrayBuffer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(1.35)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const renderPages = useCallback(async (data: ArrayBuffer, nextScale: number) => {
    if (!pagesRef.current) return
    await renderPdfToCanvases(data, pagesRef.current, nextScale)
  }, [])

  useEffect(() => {
    if (!accessToken) {
      setError("Sign in required to view this document.")
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    pdfDataRef.current = null

    async function load() {
      try {
        const blob = await fetchResourceStream(resourceId, accessToken!)
        const buffer = await blob.arrayBuffer()
        if (cancelled) return
        pdfDataRef.current = buffer
        await renderPages(buffer, scale)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load document")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
      pdfDataRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId, accessToken])

  useEffect(() => {
    if (!pdfDataRef.current || loading) return
    void renderPages(pdfDataRef.current, scale)
  }, [scale, loading, renderPages])

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === shellRef.current)
    }
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange)
  }, [])

  useEffect(() => {
    const style = document.createElement("style")
    style.setAttribute("data-secure-pdf-viewer", "print-block")
    style.textContent =
      "@media print { [data-secure-pdf-viewer] { display: none !important; visibility: hidden !important; } }"
    document.head.appendChild(style)
    return () => {
      style.remove()
    }
  }, [])

  const blockShortcuts = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && ["s", "p", "c", "a"].includes(e.key.toLowerCase())) {
      e.preventDefault()
    }
  }, [])

  useEffect(() => {
    const el = shellRef.current
    if (!el) return
    el.addEventListener("keydown", blockShortcuts)
    return () => el.removeEventListener("keydown", blockShortcuts)
  }, [blockShortcuts])

  async function toggleFullscreen() {
    const el = shellRef.current
    if (!el) return
    if (document.fullscreenElement === el) {
      await document.exitFullscreen()
    } else {
      await el.requestFullscreen()
    }
  }

  const watermark = user?.name ?? "Student"

  return (
    <div
      ref={shellRef}
      tabIndex={-1}
      data-secure-pdf-viewer=""
      className={cn(
        "relative flex min-h-[70vh] flex-col overflow-hidden rounded-xl border bg-muted/30",
        isFullscreen && "min-h-screen rounded-none border-0",
        className,
      )}
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      style={{ userSelect: "none" }}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b bg-background px-3 py-2">
        <p className="min-w-0 truncate text-sm font-medium">{title}</p>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Zoom out"
            onClick={() => setScale((s) => Math.max(0.8, s - 0.15))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Zoom in"
            onClick={() => setScale((s) => Math.min(2.5, s + 0.15))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          {onClose ? (
            <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-auto bg-zinc-200/80 dark:bg-zinc-900/50">
        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {error ? (
          <div className="flex min-h-[40vh] items-center justify-center p-6 text-center text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div
          ref={pagesRef}
          className="relative mx-auto max-w-4xl px-2 py-4"
          onDragStart={(e) => e.preventDefault()}
        />

        {!loading && !error ? (
          <div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-[0.08]"
            aria-hidden
          >
            <p className="rotate-[-24deg] text-4xl font-bold">{watermark}</p>
          </div>
        ) : null}
      </div>

      <p className="shrink-0 border-t bg-background px-4 py-2 text-center text-xs text-muted-foreground">
        View-only canvas preview — text selection, download, and printing are disabled. Screenshots
        cannot be blocked on the web.
      </p>
    </div>
  )
}
