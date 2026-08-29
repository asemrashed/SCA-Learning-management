import type { Metadata } from 'next'
import { BatchDetailView } from "@/features/batch/components/BatchDetailView"
import { serverApiUrl } from '@/lib/api-url'

interface BatchDetailPageProps {
  params: Promise<{ idOrSlug: string }>
}

export async function generateMetadata({
  params,
}: BatchDetailPageProps): Promise<Metadata> {
  const { idOrSlug } = await params
  const apiUrl = serverApiUrl()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  try {
    const res = await fetch(`${apiUrl}/batches/${idOrSlug}`)
    if (!res.ok) {
      return {}
    }
    const { data } = await res.json()
    if (!data) return {}

    const title = data.title
    const rawDescription = data.course?.description || ''
    const cleanDescription = rawDescription.replace(/<[^>]*>/g, '').trim()
    const thumbnail = data.thumbnail

    return {
      title,
      description: cleanDescription,
      openGraph: {
        title,
        description: cleanDescription,
        images: thumbnail ? [thumbnail] : [],
        url: `${siteUrl}/batches/${idOrSlug}`,
        type: 'website',
      },
    }
  } catch (error) {
    console.error('Error generating batch metadata:', error)
    return {}
  }
}

export default async function BatchDetailPage({ params }: BatchDetailPageProps) {
  const { idOrSlug } = await params
  return <BatchDetailView idOrSlug={idOrSlug} />
}
