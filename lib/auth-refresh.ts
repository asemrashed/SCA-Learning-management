import type { AuthTokensResponse } from '@/types/api'

export type RefreshResult = { data: AuthTokensResponse } | null

let inFlightRefresh: Promise<RefreshResult> | null = null

/** Deduplicate concurrent /auth/refresh calls (server rotates tokens per request). */
export function refreshSessionOnce(refreshFn: () => Promise<RefreshResult>): Promise<RefreshResult> {
  if (!inFlightRefresh) {
    inFlightRefresh = refreshFn().finally(() => {
      inFlightRefresh = null
    })
  }
  return inFlightRefresh
}
