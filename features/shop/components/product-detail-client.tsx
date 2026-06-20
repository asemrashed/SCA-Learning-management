"use client"

import Link from "next/link"
import { ProductDetailView } from "@/features/shop/components/product-detail-view"
import { useGetProductQuery } from "@/features/shop/api"
import { AppLoading } from "@/components/status/app-loading"
import { Button } from "@/components/ui/button"

interface ProductDetailClientProps {
  idOrSlug: string
}

export function ProductDetailClient({ idOrSlug }: ProductDetailClientProps) {
  const { data, isLoading, error } = useGetProductQuery(idOrSlug)

  if (isLoading) return <AppLoading message="Loading product…" />
  if (error || !data?.data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-destructive">Product not found.</p>
        <Button className="mt-4" asChild>
          <Link href="/shop">Back to shop</Link>
        </Button>
      </div>
    )
  }

  return <ProductDetailView product={data.data} idOrSlug={idOrSlug} />
}
