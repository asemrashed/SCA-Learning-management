'use client'

import { AppError } from '@/components/status/app-error'

export default function AuthError({
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
      description="Something went wrong on this page. Please try again."
      backHref="/login"
      backLabel="Back to Login"
    />
  )
}
