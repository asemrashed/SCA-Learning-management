import { ProductAdminForm } from "@/features/shop/components/product-admin-form"

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  return <ProductAdminForm productId={id} />
}
