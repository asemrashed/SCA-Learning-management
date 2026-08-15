/** Cross-browser fullscreen + mobile landscape helpers for the video player. */

export function getFullscreenElement(): Element | null {
  const doc = document as Document & { webkitFullscreenElement?: Element | null }
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}

export async function enterFullscreen(element: HTMLElement): Promise<void> {
  const el = element as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void
  }
  if (element.requestFullscreen) {
    await element.requestFullscreen()
    return
  }
  if (el.webkitRequestFullscreen) {
    await el.webkitRequestFullscreen()
    return
  }
  throw new Error("Fullscreen not supported")
}

export async function exitFullscreen(): Promise<void> {
  const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> | void }
  if (document.exitFullscreen) {
    await document.exitFullscreen()
    return
  }
  if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen()
  }
}

export function isTouchMobile(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches
}

export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  const video = document.createElement("video") as HTMLVideoElement & {
    webkitEnterFullscreen?: () => void
  }
  return isIOS && typeof video.webkitEnterFullscreen === "function"
}

export async function lockLandscapeOrientation(): Promise<void> {
  try {
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: string) => Promise<void>
    }
    await orientation.lock?.("landscape")
  } catch {
    /* Requires fullscreen + user gesture on some browsers */
  }
}

export function unlockScreenOrientation(): void {
  try {
    screen.orientation?.unlock?.()
  } catch {
    /* ignore */
  }
}

export function isVideoNativeFullscreen(
  video: HTMLVideoElement | null | undefined,
): boolean {
  if (!video) return false
  const v = video as HTMLVideoElement & { webkitDisplayingFullscreen?: boolean }
  return Boolean(v.webkitDisplayingFullscreen)
}

export function enterNativeVideoFullscreen(video: HTMLVideoElement): void {
  const v = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void }
  v.webkitEnterFullscreen?.()
}

export function exitNativeVideoFullscreen(video: HTMLVideoElement): void {
  const v = video as HTMLVideoElement & { webkitExitFullscreen?: () => void }
  v.webkitExitFullscreen?.()
}
