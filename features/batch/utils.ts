export function daysUntil(isoDate: string | null): number | null {
  if (!isoDate) return null
  const target = new Date(isoDate).getTime()
  const now = Date.now()
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function formatBatchDate(isoDate: string | null): string {
  if (!isoDate) return 'TBA'
  return new Date(isoDate).toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const BATCH_STATUS_LABEL: Record<string, string> = {
  UPCOMING: 'Upcoming',
  ACTIVE: 'Live Now',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DRAFT: 'Draft',
}
