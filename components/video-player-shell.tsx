"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFullscreen } from "@/lib/use-fullscreen"
import { VideoPlayerControls, type PLAYBACK_RATES } from "@/components/video-player-controls"
import { VideoPlayerWatermark } from "@/components/video-player-watermark"

interface VideoPlayerShellProps {
  title: string
  ready: boolean
  playing: boolean
  ended?: boolean
  muted: boolean
  volume: number
  progress: number
  current: number
  duration: number
  playbackRate: number
  autoPlay?: boolean
  /** Fills available height (e.g. inside a modal) instead of a fixed 16:9 box. */
  flexible?: boolean
  /** Modal: caps video height so controls fit without scrolling. */
  variant?: "default" | "modal"
  className?: string
  /** Combined name + phone watermark for enrolled students. */
  watermarkText?: string | null
  videoArea: ReactNode
  onTogglePlay: () => void
  onToggleMute: () => void
  onVolumeChange: (volume: number) => void
  onSeek: (value: number[]) => void
  onPlaybackRateChange: (rate: number) => void
  /** Called when the tab becomes hidden while playing (embed players should pause). */
  onVisibilityHidden?: () => void
}

export function VideoPlayerShell({
  title,
  ready,
  playing,
  ended = false,
  muted,
  volume,
  progress,
  current,
  duration,
  playbackRate,
  autoPlay = false,
  flexible = false,
  variant = "default",
  className,
  watermarkText,
  videoArea,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onSeek,
  onPlaybackRateChange,
  onVisibilityHidden,
}: VideoPlayerShellProps) {
  const { ref: fullscreenRef, element: fullscreenElement, isFullscreen, toggleFullscreen } =
    useFullscreen<HTMLDivElement>()
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hoveringControlsRef = useRef(false)
  const settingsMenuOpenRef = useRef(false)
  const [controlsVisible, setControlsVisible] = useState(true)

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = undefined
    }
  }, [])

  const scheduleHideControls = useCallback(() => {
    clearHideTimer()
    if (!playing || flexible || variant === "modal") return
    if (hoveringControlsRef.current || settingsMenuOpenRef.current) return
    hideTimer.current = setTimeout(() => {
      if (!hoveringControlsRef.current && !settingsMenuOpenRef.current) {
        setControlsVisible(false)
      }
    }, 3000)
  }, [playing, flexible, variant, clearHideTimer])

  const revealControls = useCallback(() => {
    setControlsVisible(true)
    clearHideTimer()
    scheduleHideControls()
  }, [clearHideTimer, scheduleHideControls])

  useEffect(() => {
    if (!playing) {
      setControlsVisible(true)
      clearHideTimer()
    } else {
      revealControls()
    }
    return clearHideTimer
  }, [playing, revealControls, clearHideTimer])

  useEffect(() => {
    if (!playing || !onVisibilityHidden) return
    function handleVisibilityChange() {
      if (document.hidden) onVisibilityHidden?.()
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [playing, onVisibilityHidden])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    switch (e.key) {
      case " ":
      case "k":
        e.preventDefault()
        onTogglePlay()
        break
      case "f":
        e.preventDefault()
        void toggleFullscreen()
        break
      case "m":
        e.preventDefault()
        onToggleMute()
        break
      case "ArrowLeft":
        e.preventDefault()
        onSeek([Math.max(0, progress - (e.shiftKey ? 10 : 2))])
        break
      case "ArrowRight":
        e.preventDefault()
        onSeek([Math.min(100, progress + (e.shiftKey ? 10 : 2))])
        break
      default:
        break
    }
  }

  const showOverlay = !playing && !autoPlay && ready

  return (
    <div
      ref={fullscreenRef}
      tabIndex={0}
      className={cn(
        "flex w-full flex-col bg-black outline-none",
        isFullscreen && "h-screen justify-center",
        flexible && "min-h-0 flex-1",
        variant === "modal" && !isFullscreen && "max-h-[calc(100vh-6rem)]",
        className,
      )}
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={revealControls}
      onMouseLeave={() => {
        if (playing && variant !== "modal" && !flexible && !settingsMenuOpenRef.current) {
          setControlsVisible(false)
        }
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",
          isFullscreen || flexible
            ? "min-h-0 flex-1"
            : variant === "modal"
              ? "mx-auto aspect-video max-h-[min(52vh,28rem)] w-full"
              : "aspect-video",
        )}
      >
        {videoArea}
        {watermarkText ? <VideoPlayerWatermark label={watermarkText} /> : null}
        {showOverlay && (
          <button
            type="button"
            onClick={onTogglePlay}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/30"
            aria-label={ended ? `Replay ${title}` : `Play ${title}`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
              <Play className="ml-1 h-8 w-8" fill="currentColor" />
            </span>
          </button>
        )}
        {playing && !controlsVisible && (
          <button
            type="button"
            className="absolute inset-0 z-20 cursor-default"
            aria-label="Show controls"
            onClick={revealControls}
          />
        )}
      </div>

      <VideoPlayerControls
        title={title}
        ready={ready}
        playing={playing}
        ended={ended}
        muted={muted}
        volume={volume}
        progress={progress}
        current={current}
        duration={duration}
        playbackRate={playbackRate}
        isFullscreen={isFullscreen}
        visible={controlsVisible || !playing}
        variant={variant}
        menuPortalContainer={fullscreenElement}
        onTogglePlay={onTogglePlay}
        onToggleMute={onToggleMute}
        onVolumeChange={onVolumeChange}
        onSeek={onSeek}
        onPlaybackRateChange={onPlaybackRateChange}
        onToggleFullscreen={() => void toggleFullscreen()}
        onMenuOpenChange={(open) => {
          settingsMenuOpenRef.current = open
          if (open) {
            setControlsVisible(true)
            clearHideTimer()
          } else {
            scheduleHideControls()
          }
        }}
        onMouseEnterControls={() => {
          hoveringControlsRef.current = true
          setControlsVisible(true)
          clearHideTimer()
        }}
        onMouseLeaveControls={() => {
          hoveringControlsRef.current = false
          scheduleHideControls()
        }}
      />
    </div>
  )
}

export type { PLAYBACK_RATES }
