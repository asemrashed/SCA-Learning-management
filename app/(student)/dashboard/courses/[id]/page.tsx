import { redirect } from 'next/navigation'

export default async function StudentCoursePlayerRedirect() {
  redirect('/dashboard/batches')
}
