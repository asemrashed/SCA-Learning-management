'use client'

import { AppError } from '@/components/status/app-error'

export default function AdminError({
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
      description="An admin page failed to load. Please try again."
      backHref="/admin"
      backLabel="Back to Admin"
    />
  )
}
