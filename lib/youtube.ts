/** Build a privacy-oriented YouTube embed URL (no cookies until play). */
export function toYoutubeNoCookieSrc(videoId: string, autoplay = false): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    modestbranding: "1",
    rel: "0",
    fs: "0",
    disablekb: "1",
    controls: "0",
    iv_load_policy: "3",
    playsinline: "1",
    enablejsapi: "1",
    origin: typeof window !== "undefined" ? window.location.origin : "",
    widget_referrer: typeof window !== "undefined" ? window.location.origin : "",
  })
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`
}

export function youtubeThumbnailSrc(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}
