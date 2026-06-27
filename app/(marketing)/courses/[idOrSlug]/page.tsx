import { CourseDetailView } from '@/features/course/components/course-detail-view'

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ idOrSlug: string }>
}) {
  const { idOrSlug } = await params
  return <CourseDetailView idOrSlug={idOrSlug} />
}
