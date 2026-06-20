"use client"

import { ProductPdfReader } from "@/features/shop/components/product-pdf-reader"

interface ProductPdfViewerProps {
  idOrSlug: string
  productId: string
  title: string
  priceMinor: number
  className?: string
}

export function ProductPdfViewer(props: ProductPdfViewerProps) {
  return <ProductPdfReader {...props} />
}
