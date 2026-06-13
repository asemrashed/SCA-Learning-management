'use client'

import { AppError } from '@/components/status/app-error'

export default function MarketingError({
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
      description="We couldn't load this page. Please try again or return to the homepage."
    />
  )
}
