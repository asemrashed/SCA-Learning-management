"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatBdtMinor } from "@/lib/format-currency"
import type { ProductListItem } from "@/types/api"
import { PRODUCT_TYPE_LABEL } from "@/features/shop/utils"
import { motion } from "framer-motion"

interface ProductCardProps {
  product: ProductListItem
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=250&fit=crop"

export function ProductCard({ product }: ProductCardProps) {
  const href = `/shop/${product.slug || product.id}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group overflow-hidden rounded-[20px] bg-card shadow-sm transition-all hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.thumbnail ?? FALLBACK_IMAGE}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3 bg-secondary text-secondary-foreground">
          {PRODUCT_TYPE_LABEL[product.type]}
        </Badge>
      </div>

      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 min-h-[48px] text-base font-semibold">{product.title}</h3>
        <p className="mb-4 text-lg font-bold text-primary">
          {product.priceMinor === 0 ? "Free" : formatBdtMinor(product.priceMinor)}
        </p>
        <Button variant="outline" className="w-full rounded-xl" asChild>
          <Link href={href}>
            View product
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}
