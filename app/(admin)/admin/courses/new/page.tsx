import { redirect } from 'next/navigation'

export default function AdminNewCourseRedirect() {
  redirect('/admin/batches/new')
}
