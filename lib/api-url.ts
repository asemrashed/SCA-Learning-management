const FALLBACK_INTERNAL = 'http://localhost:4000/api'

/** Browser / RTK Query base URL — use same-origin `/api` so httpOnly refresh cookies work. */
export function clientApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL
  if (!url) {
    throw new Error('NEXT_PUBLIC_API_URL is not set')
  }
  return url
}

/** Server-side fetches (RSC) — hit the API directly; no browser cookies required. */
export function serverApiUrl(): string {
  return process.env.API_INTERNAL_URL ?? FALLBACK_INTERNAL
}
