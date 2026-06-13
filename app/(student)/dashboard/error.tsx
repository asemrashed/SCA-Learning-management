'use client'

import { AppError } from '@/components/status/app-error'

export default function DashboardError({
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
      description="We couldn't load your dashboard. Please try again."
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  )
}
