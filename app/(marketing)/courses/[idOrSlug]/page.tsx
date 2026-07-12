import type { Metadata } from 'next'
import { CourseDetailView } from '@/features/course/components/course-detail-view'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ idOrSlug: string }>
}): Promise<Metadata> {
  const { idOrSlug } = await params
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  try {
    const res = await fetch(`${apiUrl}/courses/${idOrSlug}`)
    if (!res.ok) {
      return {}
    }
    const { data } = await res.json()
    if (!data) return {}

    const title = data.title
    const rawDescription = data.description || ''
    const cleanDescription = rawDescription.replace(/<[^>]*>/g, '').trim()
    const thumbnail = data.thumbnail

    return {
      title,
      description: cleanDescription,
      openGraph: {
        title,
        description: cleanDescription,
        images: thumbnail ? [thumbnail] : [],
        url: `${siteUrl}/courses/${idOrSlug}`,
        type: 'website',
      },
    }
  } catch (error) {
    console.error('Error generating course metadata:', error)
    return {}
  }
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ idOrSlug: string }>
}) {
  const { idOrSlug } = await params
  return <CourseDetailView idOrSlug={idOrSlug} />
}
