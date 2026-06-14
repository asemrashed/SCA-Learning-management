"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatBdtMinor } from "@/lib/format-currency"
import type { ProductDetail } from "@/types/api"
import { PRODUCT_TYPE_LABEL } from "@/features/shop/utils"
import {
  AddToCartButton,
  BuyNowButton,
  QuantityStepper,
} from "@/features/shop/components/buy-now-button"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop"

interface ProductDetailViewProps {
  product: ProductDetail
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState(1)

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/shop">← Back to shop</Link>
        </Button>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={product.thumbnail ?? FALLBACK_IMAGE}
            alt={product.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div>
          <Badge className="mb-3">{PRODUCT_TYPE_LABEL[product.type]}</Badge>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="mt-4 text-2xl font-bold text-primary">
            {product.priceMinor === 0 ? "Free" : formatBdtMinor(product.priceMinor)}
          </p>
          {product.stock != null ? (
            <p className="mt-2 text-sm text-muted-foreground">{product.stock} in stock</p>
          ) : null}
          {product.description ? (
            <p className="mt-6 whitespace-pre-wrap text-muted-foreground">{product.description}</p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium">Quantity</span>
            <QuantityStepper value={quantity} onChange={setQuantity} />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <BuyNowButton
              productId={product.id}
              productTitle={product.title}
              priceMinor={product.priceMinor}
              quantity={quantity}
              className="flex-1"
            />
            <AddToCartButton productId={product.id} className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  )
}
