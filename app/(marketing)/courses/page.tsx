import { CourseCatalog } from '@/features/course/components/course-catalog'
import { Suspense } from 'react'

export default function CoursesPage() {
  return (
    <main>
      <Suspense fallback={<p className="px-4 py-12 text-center text-muted-foreground">Loading courses…</p>}>
        <CourseCatalog />
      </Suspense>
    </main>
  )
}
