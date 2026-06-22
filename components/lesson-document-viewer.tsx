"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, ZoomIn, ZoomOut } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"
import { Button } from "@/components/ui/button"
import { fetchLessonDocumentStream } from "@/lib/fetch-lesson-video"
import { renderPdfToCanvases } from "@/lib/load-pdfjs"
import { cn } from "@/lib/utils"

const PDF_RENDER_SCALE = 1.1
const ZOOM_MIN = 0.75
const ZOOM_MAX = 2
const ZOOM_STEP = 0.15

interface LessonDocumentViewerProps {
  lessonId: string
  title: string
  className?: string
}

export function LessonDocumentViewer({
  lessonId,
  title,
  className,
}: LessonDocumentViewerProps) {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken)
  const pagesRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(1)

  const renderPages = useCallback(async (data: ArrayBuffer) => {
    if (!pagesRef.current) return
    await renderPdfToCanvases(data, pagesRef.current, PDF_RENDER_SCALE)
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

    async function load() {
      try {
        const blob = await fetchLessonDocumentStream(lessonId, accessToken!)
        const buffer = await blob.arrayBuffer()
        if (cancelled) return
        await renderPages(buffer)
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
    }
  }, [lessonId, accessToken, renderPages])

  return (
    <div
      className={cn("flex h-full min-h-0 flex-col", className)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2">
        <p className="min-w-0 truncate text-sm font-medium">{title}</p>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-auto bg-zinc-200/80 dark:bg-zinc-900/50">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {error ? (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div
          ref={pagesRef}
          className="mx-auto max-w-full px-2 py-3"
          style={{ zoom }}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>
    </div>
  )
}
