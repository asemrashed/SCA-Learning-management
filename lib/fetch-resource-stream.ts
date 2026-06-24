import { clientApiUrl } from '@/lib/api-url'

const baseUrl = clientApiUrl()

export function resourceStreamUrl(resourceId: string): string {
  return `${baseUrl}/resources/${resourceId}/stream`
}

export function submissionResultStreamUrl(submissionId: string): string {
  return `${baseUrl}/me/resource-submissions/${submissionId}/result/stream`
}

export function adminSubmissionResultStreamUrl(submissionId: string): string {
  return `${baseUrl}/admin/resource-submissions/${submissionId}/result/stream`
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

export async function fetchSubmissionResultStream(
  submissionId: string,
  accessToken: string,
  variant: 'student' | 'admin' = 'student',
): Promise<Blob> {
  const url =
    variant === 'admin'
      ? adminSubmissionResultStreamUrl(submissionId)
      : submissionResultStreamUrl(submissionId)
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    let message = 'Could not load result'
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
