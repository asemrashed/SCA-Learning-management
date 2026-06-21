export type VideoSource =
  | { kind: "youtube"; videoId: string }
  | { kind: "vimeo"; videoId: string }
  | { kind: "file"; src: string }

const YOUTUBE_ID = /[a-zA-Z0-9_-]{11}/

export function extractYoutubeVideoId(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  const pathMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  )
  if (pathMatch?.[1]) return pathMatch[1]

  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`)
    const host = parsed.hostname.replace(/^www\./, "")
    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0]
      return id && YOUTUBE_ID.test(id) ? id : null
    }
    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      const v = parsed.searchParams.get("v")
      if (v && YOUTUBE_ID.test(v)) return v
      const parts = parsed.pathname.split("/").filter(Boolean)
      const embedIdx = parts.indexOf("embed")
      if (embedIdx >= 0 && parts[embedIdx + 1] && YOUTUBE_ID.test(parts[embedIdx + 1]!)) {
        return parts[embedIdx + 1]!
      }
      const shortsIdx = parts.indexOf("shorts")
      if (shortsIdx >= 0 && parts[shortsIdx + 1] && YOUTUBE_ID.test(parts[shortsIdx + 1]!)) {
        return parts[shortsIdx + 1]!
      }
    }
  } catch {
    // not a valid URL — fall through
  }

  return null
}

export function extractVimeoVideoId(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  const match = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (match?.[1]) return match[1]

  if (trimmed.includes("player.vimeo.com")) {
    return trimmed.match(/video\/(\d+)/)?.[1] ?? null
  }

  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`)
    if (parsed.hostname.includes("vimeo.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean)
      const id = parts[parts.length - 1]
      if (id && /^\d+$/.test(id)) return id
    }
  } catch {
    // ignore
  }

  return null
}

/** Resolve an admin-supplied full video URL to a player source. */
export function resolveVideoSource(url: string): VideoSource | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  const youtubeId = extractYoutubeVideoId(trimmed)
  if (youtubeId) return { kind: "youtube", videoId: youtubeId }

  const vimeoId = extractVimeoVideoId(trimmed)
  if (vimeoId) return { kind: "vimeo", videoId: vimeoId }

  if (/^https?:\/\//i.test(trimmed)) {
    return { kind: "file", src: trimmed }
  }

  return null
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export { formatTime as formatVideoTime }
