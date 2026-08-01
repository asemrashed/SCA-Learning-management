const DEFAULT_VIDEO_SKIP_SECONDS = 5

function parseEnvFlag(raw: string | undefined): boolean {
  if (!raw) return false
  const normalized = raw.trim().toLowerCase()
  return normalized === "1" || normalized === "true" || normalized === "yes"
}

export function isVideoSkipEnabled(): boolean {
  return parseEnvFlag(process.env.NEXT_PUBLIC_VIDEO_SKIP_ENABLED)
}

export function getVideoSkipSeconds(): number {
  const raw = process.env.NEXT_PUBLIC_VIDEO_SKIP_SECONDS
  if (!raw) return DEFAULT_VIDEO_SKIP_SECONDS
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 120) {
    return DEFAULT_VIDEO_SKIP_SECONDS
  }
  return parsed
}

export function clampSeekTime(
  current: number,
  duration: number,
  deltaSeconds: number,
): number {
  const next = current + deltaSeconds
  if (!Number.isFinite(duration) || duration <= 0) return Math.max(0, next)
  return Math.max(0, Math.min(duration, next))
}
