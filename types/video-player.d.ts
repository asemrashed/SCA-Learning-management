export {}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
    YT: typeof YT
    Vimeo: {
      Player: new (element: HTMLIFrameElement) => VimeoPlayer
    }
  }

  namespace YT {
    enum PlayerState {
      UNSTARTED = -1,
      ENDED = 0,
      PLAYING = 1,
      PAUSED = 2,
      BUFFERING = 3,
      CUED = 5,
    }

    interface PlayerOptions {
      videoId?: string
      width?: string | number
      height?: string | number
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: (event: { target: Player }) => void
        onStateChange?: (event: { data: number; target: Player }) => void
      }
    }

    class Player {
      constructor(element: HTMLElement, options: PlayerOptions)
      playVideo(): void
      pauseVideo(): void
      mute(): void
      unMute(): void
      seekTo(seconds: number, allowSeekAhead: boolean): void
      getCurrentTime(): number
      getDuration(): number
      getVolume(): number
      setVolume(volume: number): void
      setPlaybackRate(rate: number): void
      destroy(): void
    }
  }

  interface VimeoPlayer {
    ready(): Promise<void>
    play(): Promise<void>
    pause(): Promise<void>
    setMuted(muted: boolean): Promise<boolean>
    getCurrentTime(): Promise<number>
    getDuration(): Promise<number>
    getVolume(): Promise<number>
    setVolume(volume: number): Promise<number>
    setPlaybackRate(rate: number): Promise<number>
    setCurrentTime(seconds: number): Promise<number>
    destroy(): Promise<void>
    on(event: "play" | "pause" | "ended", callback: () => void): void
  }
}
