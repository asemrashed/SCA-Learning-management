import { redirect } from 'next/navigation'

export default async function AdminCourseEditRedirect() {
  redirect('/admin/batches')
}
