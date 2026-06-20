"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProductPdfReader } from "@/features/shop/components/product-pdf-reader"

interface ProductReadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  title: string
  priceMinor?: number
  /** When true, show full document (confirmed purchase). */
  purchased?: boolean
}

export function ProductReadModal({
  open,
  onOpenChange,
  productId,
  title,
  priceMinor = 0,
  purchased = true,
}: ProductReadModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[min(92vh,900px)] max-h-[92vh] w-[min(96vw,1100px)] max-w-[96vw] flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle className="truncate pr-8">{title}</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-auto p-2 sm:p-4">
          {open ? (
            <ProductPdfReader
              idOrSlug={productId}
              productId={productId}
              title={title}
              priceMinor={priceMinor}
              hideBuySection={purchased}
              className="h-full"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
