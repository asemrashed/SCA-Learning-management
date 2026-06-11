import { BatchDetailView } from "@/features/batch/components/BatchDetailView"

interface BatchDetailPageProps {
  params: Promise<{ idOrSlug: string }>
}

export default async function BatchDetailPage({ params }: BatchDetailPageProps) {
  const { idOrSlug } = await params
  return <BatchDetailView idOrSlug={idOrSlug} />
}
