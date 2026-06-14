import { ProductDetailClient } from "@/features/shop/components/product-detail-client"

interface ProductDetailPageProps {
  params: Promise<{ idOrSlug: string }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { idOrSlug } = await params
  return <ProductDetailClient idOrSlug={idOrSlug} />
}
