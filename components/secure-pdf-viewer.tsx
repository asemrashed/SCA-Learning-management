"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, X } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"
import { Button } from "@/components/ui/button"
import { fetchResourceStream } from "@/lib/fetch-resource-stream"
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
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!accessToken) {
      setError("Sign in required to view this document.")
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setBlobUrl(null)

    async function load() {
      try {
        const blob = await fetchResourceStream(resourceId, accessToken!)
        if (cancelled) return

        const pdfBlob =
          blob.type === "application/pdf"
            ? blob
            : new Blob([blob], { type: "application/pdf" })

        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current)
        }
        const url = URL.createObjectURL(pdfBlob)
        objectUrlRef.current = url
        setBlobUrl(url)
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
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [resourceId, accessToken])

  const blockShortcuts = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && ["s", "p", "c", "a"].includes(e.key.toLowerCase())) {
      e.preventDefault()
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener("keydown", blockShortcuts)
    return () => el.removeEventListener("keydown", blockShortcuts)
  }, [blockShortcuts])

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={cn(
        "relative flex min-h-[70vh] flex-col overflow-hidden rounded-xl border bg-muted/30",
        className,
      )}
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: "none" }}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-background px-4 py-2">
        <p className="truncate text-sm font-medium">{title}</p>
        {onClose ? (
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="relative min-h-[60vh] flex-1 bg-muted/20">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {blobUrl && !loading && !error ? (
          <embed
            src={`${blobUrl}#toolbar=0&navpanes=0`}
            type="application/pdf"
            title={title}
            className="absolute inset-0 h-full w-full"
          />
        ) : null}
      </div>

      <p className="shrink-0 border-t bg-background px-4 py-2 text-center text-xs text-muted-foreground">
        View-only — downloading and copying are disabled.
      </p>
    </div>
  )
}
