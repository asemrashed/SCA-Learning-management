import { redirect } from 'next/navigation'
import { LIVE_COURSE_CATALOG_HREF } from '@/lib/product-vocabulary'

export default function CoursesPage() {
  redirect(LIVE_COURSE_CATALOG_HREF)
}
