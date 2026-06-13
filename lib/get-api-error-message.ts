import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

interface ApiErrorPayload {
  error?: {
    message?: string
    details?: { field?: string; issue: string }[]
  }
  message?: string
  details?: { issue: string }[]
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback

  const fetchError = error as FetchBaseQueryError
  if ('data' in fetchError && fetchError.data && typeof fetchError.data === 'object') {
    const body = fetchError.data as ApiErrorPayload
    const nested = body.error
    const message = nested?.message ?? body.message
    const details = nested?.details ?? body.details

    if (details?.length) {
      const detailText = details.map((d) => d.issue).join(' ')
      if (message && message !== 'Validation failed') {
        return `${message}: ${detailText}`
      }
      return detailText
    }
    if (message) return message
  }

  if ('status' in fetchError) {
    if (fetchError.status === 'FETCH_ERROR') {
      return 'Network error — is the API server running?'
    }
    if (fetchError.status === 403) {
      return 'You do not have permission for this action.'
    }
  }

  if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
    return (error as { message: string }).message
  }

  return fallback
}
