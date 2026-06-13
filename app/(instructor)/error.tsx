'use client'

import { AppError } from '@/components/status/app-error'

export default function InstructorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <AppError
      error={error}
      reset={reset}
      description="An instructor page failed to load. Please try again."
      backHref="/instructor"
      backLabel="Back to Instructor"
    />
  )
}
