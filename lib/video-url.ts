export type VideoSource =
  | { kind: "youtube"; videoId: string }
  | { kind: "vimeo"; videoId: string }
  | { kind: "file"; src: string }

export function extractYoutubeVideoId(url: string): string | null {
  const trimmed = url.trim()
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  )
  return match?.[1] ?? null
}

export function extractVimeoVideoId(url: string): string | null {
  const trimmed = url.trim()
  const match = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match?.[1] ?? null
}

/** Resolve a stored lesson URL to a locked-down player source (no raw watch links in UI). */
export function resolveVideoSource(url: string): VideoSource | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  const youtubeId = extractYoutubeVideoId(trimmed)
  if (youtubeId) return { kind: "youtube", videoId: youtubeId }

  const vimeoId = extractVimeoVideoId(trimmed)
  if (vimeoId) return { kind: "vimeo", videoId: vimeoId }

  if (trimmed.includes("youtube.com/embed")) {
    const id = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/)?.[1]
    if (id) return { kind: "youtube", videoId: id }
  }

  if (trimmed.includes("player.vimeo.com")) {
    const id = trimmed.match(/video\/(\d+)/)?.[1]
    if (id) return { kind: "vimeo", videoId: id }
  }

  return { kind: "file", src: trimmed }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export { formatTime as formatVideoTime }
