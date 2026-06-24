import { clientApiUrl } from '@/lib/api-url'

const baseUrl = clientApiUrl()

export function productStreamUrl(idOrSlug: string): string {
  return `${baseUrl}/products/${idOrSlug}/stream`
}

export async function fetchProductStream(
  idOrSlug: string,
  accessToken?: string | null,
): Promise<{ blob: Blob; isPreview: boolean }> {
  const headers: HeadersInit = {}
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await fetch(productStreamUrl(idOrSlug), {
    headers,
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    let message = 'Could not load document'
    try {
      const body = (await res.json()) as { error?: { message?: string } }
      if (body.error?.message) message = body.error.message
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  const contentType = res.headers.get('content-type') ?? 'application/pdf'
  const isPreview = res.headers.get('x-preview-mode') === 'preview'
  const buffer = await res.arrayBuffer()
  return { blob: new Blob([buffer], { type: contentType }), isPreview }
}
