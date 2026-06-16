let resolveReady: (() => void) | null = null
let readyPromise: Promise<void> | null = null

function getReadyPromise(): Promise<void> {
  if (!readyPromise) {
    readyPromise = new Promise<void>((resolve) => {
      resolveReady = resolve
    })
  }
  return readyPromise
}

/** Called once when client auth bootstrap finishes (success or failure). */
export function markAuthReady(): void {
  resolveReady?.()
  resolveReady = null
}

/** Wait for bootstrap before sending authenticated API calls after a full page load. */
export function waitForAuthReady(): Promise<void> {
  return getReadyPromise()
}
