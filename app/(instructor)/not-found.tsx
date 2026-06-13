import { AppNotFound } from '@/components/status/app-not-found'

export default function InstructorNotFound() {
  return (
    <AppNotFound
      description="This instructor page doesn't exist."
      backHref="/instructor"
      backLabel="Back to Instructor"
    />
  )
}
