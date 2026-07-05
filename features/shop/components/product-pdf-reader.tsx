"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, Lock } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"
import { PdfViewerShell, PDF_ZOOM_MAX, PDF_ZOOM_MIN, PDF_ZOOM_STEP } from "@/components/pdf-viewer-shell"
import { fetchProductStream } from "@/lib/fetch-product-stream"
import { buildWatermarkLabel } from "@/lib/build-watermark-label"
import { renderPdfToCanvases } from "@/lib/load-pdfjs"
import { cn } from "@/lib/utils"
import { useGetProductDigitalAccessQuery } from "@/features/shop/api"
import {
  AddToCartButton,
  BuyNowButton,
  QuantityStepper,
} from "@/features/shop/components/buy-now-button"

const PDF_RENDER_SCALE = 1.35

export interface ProductPdfReaderProps {
  idOrSlug: string
  productId: string
  title: string
  priceMinor: number
  className?: string
  /** Hide purchase prompts (e.g. when opened from a confirmed order). */
  hideBuySection?: boolean
}

export function ProductPdfReader({
  idOrSlug,
  productId,
  title,
  priceMinor,
  className,
  hideBuySection = false,
}: ProductPdfReaderProps) {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken)
  const user = useSelector((state: RootState) => state.auth.user)
  const pagesRef = useRef<HTMLDivElement>(null)
  const pdfDataRef = useRef<ArrayBuffer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [quantity, setQuantity] = useState(1)

  const { data: accessData, isLoading: accessLoading } = useGetProductDigitalAccessQuery(idOrSlug)
  const access = accessData?.data
  const hasFullAccess = hideBuySection || Boolean(access?.hasFullAccess)
  const showBuyPrompt =
    !hideBuySection && !access?.hasFullAccess && (access?.freePreviewPages ?? 0) > 0

  const watermarkLabel = buildWatermarkLabel(undefined, undefined, user?.name, user?.phone)

  const renderPages = useCallback(
    async (data: ArrayBuffer) => {
      if (!pagesRef.current) return
      const maxPreviewPages = hasFullAccess ? undefined : access?.freePreviewPages
      const result = await renderPdfToCanvases(data, pagesRef.current, PDF_RENDER_SCALE, {
        maxPreviewPages,
      })
      setTotalPages(result.totalPages)
    },
    [access?.freePreviewPages, hasFullAccess],
  )

  useEffect(() => {
    if (accessLoading || !access?.hasDigitalFile) return

    let cancelled = false
    setLoading(true)
    setError(null)
    pdfDataRef.current = null

    async function load() {
      try {
        const { blob } = await fetchProductStream(idOrSlug, accessToken ?? undefined)
        const buffer = await blob.arrayBuffer()
        if (cancelled) return
        pdfDataRef.current = buffer
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
      pdfDataRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    idOrSlug,
    accessToken,
    accessLoading,
    access?.hasDigitalFile,
    access?.hasFullAccess,
    hideBuySection,
    renderPages,
  ])

  if (accessLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-xl border bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!access?.hasDigitalFile) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        No digital file is attached to this product.
      </p>
    )
  }

  const footerText = showBuyPrompt
    ? `Free preview — ${access?.freePreviewPages} page${access?.freePreviewPages === 1 ? "" : "s"} shown. Purchase to read the full document.`
    : undefined

  return (
    <div className={cn("space-y-4", className)}>
      <PdfViewerShell
        title={title}
        loading={loading}
        error={error}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(PDF_ZOOM_MAX, z + PDF_ZOOM_STEP))}
        onZoomOut={() => setZoom((z) => Math.max(PDF_ZOOM_MIN, z - PDF_ZOOM_STEP))}
        footerText={footerText}
        watermarkLabel={watermarkLabel}
        guardEnabled={!loading && !error}
        dataAttribute="data-product-pdf-viewer"
      >
        <div
          ref={pagesRef}
          className="relative mx-auto max-w-4xl px-2 py-4"
          onDragStart={(e) => e.preventDefault()}
        />

        {!loading && !error && showBuyPrompt ? (
          <div className="mx-auto max-w-4xl px-2 pb-4">
            <div className="relative overflow-hidden rounded-lg border bg-background/80">
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 bg-muted/60 p-8 backdrop-blur-sm">
                <Lock className="h-8 w-8 text-muted-foreground" />
                <p className="text-center text-sm font-medium text-muted-foreground">
                  {totalPages > (access?.freePreviewPages ?? 0)
                    ? `${totalPages - Math.ceil(access?.freePreviewPages ?? 0)} more page${totalPages - Math.ceil(access?.freePreviewPages ?? 0) === 1 ? "" : "s"} locked`
                    : "Remaining content is locked"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </PdfViewerShell>

      {showBuyPrompt ? (
        <div className="rounded-xl border bg-muted/40 p-6">
          <h3 className="text-lg font-semibold">Buy to continue reading</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You have reached the end of the free preview. Purchase this product to unlock the full
            PDF. After admin confirms your order, return here or use Read on My Orders.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium">Quantity</span>
            <QuantityStepper value={quantity} onChange={setQuantity} />
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <BuyNowButton
              productId={productId}
              productTitle={title}
              priceMinor={priceMinor}
              quantity={quantity}
              className="flex-1"
              label="Buy to continue reading"
            />
            <AddToCartButton productId={productId} className="flex-1" />
          </div>
        </div>
      ) : null}
    </div>
  )
}
