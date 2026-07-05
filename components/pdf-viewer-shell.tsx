"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { Loader2, Maximize2, Minimize2, X, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PdfViewerWatermark } from "@/components/pdf-viewer-watermark"
import { usePdfCaptureGuard } from "@/lib/use-pdf-capture-guard"
import { cn } from "@/lib/utils"

export const PDF_ZOOM_MIN = 0.75
export const PDF_ZOOM_MAX = 2.5
export const PDF_ZOOM_STEP = 0.15

interface PdfViewerShellProps {
  title: string
  loading?: boolean
  error?: string | null
  zoom?: number
  onZoomIn?: () => void
  onZoomOut?: () => void
  showFullscreen?: boolean
  onClose?: () => void
  footerText?: string
  watermarkLabel?: string | null
  guardEnabled?: boolean
  className?: string
  shellClassName?: string
  dataAttribute?: string
  variant?: "default" | "embedded"
  toolbarExtra?: ReactNode
  children: ReactNode
}

export function PdfViewerShell({
  title,
  loading = false,
  error = null,
  zoom = 1,
  onZoomIn,
  onZoomOut,
  showFullscreen = true,
  onClose,
  footerText,
  watermarkLabel,
  guardEnabled = false,
  className,
  shellClassName,
  dataAttribute = "data-pdf-viewer",
  variant = "default",
  toolbarExtra,
  children,
}: PdfViewerShellProps) {
  const shellRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { contentHidden, focusLossCount, focusLossThreshold } = usePdfCaptureGuard(guardEnabled)

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === shellRef.current)
    }
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange)
  }, [])

  useEffect(() => {
    const style = document.createElement("style")
    style.setAttribute(dataAttribute, "print-block")
    style.textContent = `@media print { [${dataAttribute}] { display: none !important; visibility: hidden !important; } }`
    document.head.appendChild(style)
    return () => {
      style.remove()
    }
  }, [dataAttribute])

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

  const showWatermark = Boolean(watermarkLabel) && !loading && !error
  const showGuardOverlay = guardEnabled && contentHidden && !loading && !error
  const showWarning =
    guardEnabled && focusLossCount > 0 && focusLossCount < focusLossThreshold

  const defaultFooter =
    "View-only preview — content is hidden when you leave this tab. Repeated attempts may sign you out."

  return (
    <div
      ref={shellRef}
      tabIndex={-1}
      {...{ [dataAttribute]: "" }}
      className={cn(
        "relative flex flex-col overflow-hidden",
        variant === "default" && "min-h-[70vh] rounded-xl border bg-muted/30",
        variant === "embedded" && "h-full min-h-0",
        isFullscreen && "min-h-screen rounded-none border-0",
        shellClassName,
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
          {onZoomOut ? (
            <Button type="button" variant="ghost" size="icon" aria-label="Zoom out" onClick={onZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          ) : null}
          {onZoomIn ? (
            <Button type="button" variant="ghost" size="icon" aria-label="Zoom in" onClick={onZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          ) : null}
          {showFullscreen ? (
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
          ) : null}
          {toolbarExtra}
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
          className={cn(showGuardOverlay && "invisible")}
          style={onZoomIn || onZoomOut ? { zoom } : undefined}
        >
          {children}
        </div>

        {showWatermark && watermarkLabel ? <PdfViewerWatermark label={watermarkLabel} /> : null}

        {showGuardOverlay ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background p-6 text-center">
            <p className="max-w-sm text-sm text-muted-foreground">
              Content hidden — return to this tab to continue reading.
            </p>
          </div>
        ) : null}
      </div>

      <p
        className={cn(
          "shrink-0 border-t bg-background px-4 py-2 text-center text-xs text-muted-foreground",
          showWarning && "text-amber-700 dark:text-amber-400",
        )}
      >
        {showWarning
          ? `Suspicious activity detected (${focusLossCount}/${focusLossThreshold}). Repeated attempts will sign you out.`
          : footerText ?? defaultFooter}
      </p>
    </div>
  )
}
