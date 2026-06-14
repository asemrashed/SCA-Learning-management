import { redirect } from 'next/navigation'

export default async function AdminCourseDetailRedirect() {
  redirect('/admin/batches')
}
