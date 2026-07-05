"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"
import { PdfViewerShell, PDF_ZOOM_MAX, PDF_ZOOM_MIN, PDF_ZOOM_STEP } from "@/components/pdf-viewer-shell"
import { fetchResourceStream, fetchSubmissionResultStream } from "@/lib/fetch-resource-stream"
import { buildWatermarkLabel } from "@/lib/build-watermark-label"
import { renderPdfToCanvases } from "@/lib/load-pdfjs"

const PDF_RENDER_SCALE = 1.35

interface SecurePdfViewerProps {
  resourceId?: string
  submissionId?: string
  submissionStream?: "student" | "admin"
  title: string
  onClose?: () => void
  className?: string
}

export function SecurePdfViewer({
  resourceId,
  submissionId,
  submissionStream = "student",
  title,
  onClose,
  className,
}: SecurePdfViewerProps) {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken)
  const user = useSelector((state: RootState) => state.auth.user)
  const pagesRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(1)

  const watermarkLabel = buildWatermarkLabel(undefined, undefined, user?.name, user?.phone)

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
        const blob = submissionId
          ? await fetchSubmissionResultStream(submissionId, accessToken!, submissionStream)
          : await fetchResourceStream(resourceId!, accessToken!)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId, submissionId, submissionStream, accessToken, renderPages])

  return (
    <PdfViewerShell
      title={title}
      loading={loading}
      error={error}
      zoom={zoom}
      onZoomIn={() => setZoom((z) => Math.min(PDF_ZOOM_MAX, z + PDF_ZOOM_STEP))}
      onZoomOut={() => setZoom((z) => Math.max(PDF_ZOOM_MIN, z - PDF_ZOOM_STEP))}
      onClose={onClose}
      watermarkLabel={watermarkLabel}
      guardEnabled={!loading && !error}
      dataAttribute="data-secure-pdf-viewer"
      className={className}
    >
      <div
        ref={pagesRef}
        className="relative mx-auto max-w-4xl px-2 py-4"
        onDragStart={(e) => e.preventDefault()}
      />
    </PdfViewerShell>
  )
}
