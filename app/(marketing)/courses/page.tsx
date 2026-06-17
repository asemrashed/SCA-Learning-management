import { CourseCatalog } from '@/features/course/components/course-catalog'
import { Suspense } from 'react'

export default function CoursesPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <Suspense fallback={<p className="text-center text-muted-foreground">Loading courses…</p>}>
        <CourseCatalog />
      </Suspense>
    </main>
  )
}
