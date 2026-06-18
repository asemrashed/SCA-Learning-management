import { notFound } from 'next/navigation'
import { CourseDetailView } from '@/features/course/components/course-detail-view'
import { DeliveryMode, type CourseDetail } from '@/types/api'

async function fetchCourse(idOrSlug: string): Promise<CourseDetail | null> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'
  const res = await fetch(`${base}/courses/${idOrSlug}`, { next: { revalidate: 60 } })
  if (!res.ok) return null
  const json = (await res.json()) as { data: CourseDetail }
  return json.data
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ idOrSlug: string }>
}) {
  const { idOrSlug } = await params
  const course = await fetchCourse(idOrSlug)
  if (!course) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <CourseDetailView course={course} />
    </main>
  )
}
