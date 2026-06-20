"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, Lock, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"
import { Button } from "@/components/ui/button"
import { fetchProductStream } from "@/lib/fetch-product-stream"
import { renderPdfToCanvases } from "@/lib/load-pdfjs"
import { cn } from "@/lib/utils"
import { useGetProductDigitalAccessQuery } from "@/features/shop/api"
import {
  AddToCartButton,
  BuyNowButton,
  QuantityStepper,
} from "@/features/shop/components/buy-now-button"

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
  const shellRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<HTMLDivElement>(null)
  const pdfDataRef = useRef<ArrayBuffer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.35)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const { data: accessData, isLoading: accessLoading } = useGetProductDigitalAccessQuery(idOrSlug)
  const access = accessData?.data
  const hasFullAccess = hideBuySection || Boolean(access?.hasFullAccess)
  const showBuyPrompt =
    !hideBuySection && !access?.hasFullAccess && (access?.freePreviewPages ?? 0) > 0

  const renderPages = useCallback(
    async (data: ArrayBuffer, nextScale: number) => {
      if (!pagesRef.current) return
      const maxPreviewPages = hasFullAccess ? undefined : access?.freePreviewPages
      const result = await renderPdfToCanvases(data, pagesRef.current, nextScale, {
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
  }, [
    idOrSlug,
    accessToken,
    accessLoading,
    access?.hasDigitalFile,
    access?.hasFullAccess,
    hideBuySection,
  ])

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
    style.setAttribute("data-product-pdf-viewer", "print-block")
    style.textContent =
      "@media print { [data-product-pdf-viewer] { display: none !important; visibility: hidden !important; } }"
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

  return (
    <div className={cn("space-y-4", className)}>
      <div
        ref={shellRef}
        tabIndex={-1}
        data-product-pdf-viewer=""
        className={cn(
          "relative flex min-h-[70vh] flex-col overflow-hidden rounded-xl border bg-muted/30",
          isFullscreen && "min-h-screen rounded-none border-0",
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
        </div>

        <p className="shrink-0 border-t bg-background px-4 py-2 text-center text-xs text-muted-foreground">
          {showBuyPrompt
            ? `Free preview — ${access?.freePreviewPages} page${access?.freePreviewPages === 1 ? "" : "s"} shown. Purchase to read the full document.`
            : "View-only canvas preview — text selection, download, and printing are disabled."}
        </p>
      </div>

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
