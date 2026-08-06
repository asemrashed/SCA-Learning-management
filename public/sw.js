// SCA service worker — app-shell + image caching only.
// Never intercepts /api/* — enrollment/payment/attendance state must always be fresh.

const SW_VERSION = 'v1'
const SHELL_CACHE = `sca-shell-${SW_VERSION}`
const IMAGE_CACHE = `sca-images-${SW_VERSION}`
const SHELL_ASSETS = ['/', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GETs from our own origin.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // Never cache API traffic — RTK Query owns freshness for dynamic/financial data.
  if (url.pathname.startsWith('/api/')) return

  // Images: stale-while-revalidate.
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
          .catch(() => cached)
        return cached || networkFetch
      })
    )
    return
  }

  // Everything else (app shell, pages): network-first, fall back to cache when offline.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
  )
})
