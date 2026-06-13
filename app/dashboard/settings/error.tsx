'use client'

import { AppError } from '@/components/status/app-error'

export default function SettingsError({
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
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  )
}
