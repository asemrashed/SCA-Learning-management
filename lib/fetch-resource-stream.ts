const baseUrl = process.env.NEXT_PUBLIC_API_URL
if (!baseUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is not set')
}

export function resourceStreamUrl(resourceId: string): string {
  return `${baseUrl}/resources/${resourceId}/stream`
}

export async function fetchResourceStream(
  resourceId: string,
  accessToken: string,
): Promise<Blob> {
  const res = await fetch(resourceStreamUrl(resourceId), {
    headers: { Authorization: `Bearer ${accessToken}` },
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
