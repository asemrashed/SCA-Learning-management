const baseUrl = process.env.NEXT_PUBLIC_API_URL
if (!baseUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is not set')
}

export type LessonPlayKind = 'youtube' | 'vimeo' | 'file'

function authHeaders(accessToken: string | null | undefined): HeadersInit {
  const headers: HeadersInit = {}
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }
  return headers
}

export function lessonStreamUrl(lessonId: string): string {
  return `${baseUrl}/lessons/${lessonId}/stream`
}

export function lessonDocumentStreamUrl(lessonId: string): string {
  return `${baseUrl}/lessons/${lessonId}/document-stream`
}

export async function fetchLessonPlayMeta(
  lessonId: string,
  accessToken?: string | null,
): Promise<{ kind: LessonPlayKind; title: string }> {
  const res = await fetch(`${baseUrl}/lessons/${lessonId}/play-meta`, {
    headers: authHeaders(accessToken),
    credentials: 'include',
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error('Could not load video metadata')
  }
  const body = (await res.json()) as { data: { kind: LessonPlayKind; title: string } }
  return body.data
}

export async function fetchLessonEmbedHtml(
  lessonId: string,
  accessToken: string | null | undefined,
  autoplay: boolean,
): Promise<string> {
  const url = new URL(`${baseUrl}/lessons/${lessonId}/embed`)
  url.searchParams.set('origin', window.location.origin)
  if (autoplay) url.searchParams.set('autoplay', '1')

  const res = await fetch(url.toString(), {
    headers: authHeaders(accessToken),
    credentials: 'include',
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error('Could not load video player')
  }
  return res.text()
}

export async function fetchLessonThumbnailBlob(
  lessonId: string,
  accessToken?: string | null,
): Promise<string | null> {
  const res = await fetch(`${baseUrl}/lessons/${lessonId}/thumbnail`, {
    headers: authHeaders(accessToken),
    credentials: 'include',
    cache: 'no-store',
  })
  if (res.status === 204 || !res.ok) return null
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

export async function fetchLessonVideoBlob(
  lessonId: string,
  accessToken?: string | null,
): Promise<Blob> {
  const res = await fetch(lessonStreamUrl(lessonId), {
    headers: authHeaders(accessToken),
    credentials: 'include',
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error('Could not load video')
  }
  return res.blob()
}

export async function fetchLessonDocumentStream(
  lessonId: string,
  accessToken: string,
): Promise<Blob> {
  const res = await fetch(lessonDocumentStreamUrl(lessonId), {
    headers: authHeaders(accessToken),
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
  const buffer = await res.arrayBuffer()
  return new Blob([buffer], { type: contentType })
}

export function createBlobHtmlUrl(html: string): string {
  return URL.createObjectURL(new Blob([html], { type: 'text/html' }))
}

export function revokeBlobUrl(url: string | null | undefined): void {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}
