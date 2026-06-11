let youtubeApiReady: Promise<void> | null = null

export function loadYoutubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.YT?.Player) return Promise.resolve()
  if (youtubeApiReady) return youtubeApiReady

  youtubeApiReady = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement("script")
      script.src = "https://www.youtube.com/iframe_api"
      script.async = true
      document.head.appendChild(script)
    }
  })

  return youtubeApiReady
}

let vimeoApiReady: Promise<void> | null = null

export function loadVimeoPlayerApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.Vimeo?.Player) return Promise.resolve()
  if (vimeoApiReady) return vimeoApiReady

  vimeoApiReady = new Promise((resolve) => {
    if (!document.querySelector('script[src*="player.vimeo.com/api/player.js"]')) {
      const script = document.createElement("script")
      script.src = "https://player.vimeo.com/api/player.js"
      script.async = true
      script.onload = () => resolve()
      document.head.appendChild(script)
    } else {
      resolve()
    }
  })

  return vimeoApiReady
}
