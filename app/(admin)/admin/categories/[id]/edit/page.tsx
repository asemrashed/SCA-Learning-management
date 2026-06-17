import { CategoryAdminForm } from "@/features/category/components/category-admin-form"

interface EditCategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params
  return <CategoryAdminForm categoryId={id} />
}
