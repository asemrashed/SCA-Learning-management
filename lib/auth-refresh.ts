let inFlightRefresh: Promise<unknown> | null = null

/** Deduplicate concurrent /auth/refresh calls (server rotates tokens per request). */
export function refreshSessionOnce<T>(refreshFn: () => Promise<T>): Promise<T> {
  if (!inFlightRefresh) {
    inFlightRefresh = refreshFn().finally(() => {
      inFlightRefresh = null
    })
  }
  return inFlightRefresh as Promise<T>
}
