"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Pause, Play, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { formatVideoTime } from "@/lib/video-url"
import { loadYoutubeIframeApi } from "@/lib/load-video-apis"

interface YoutubeEmbedPlayerProps {
  videoId: string
  title: string
  autoPlay?: boolean
  className?: string
}

/** YouTube player with iframe click-shield — users cannot reach YouTube UI or outbound links. */
export function YoutubeEmbedPlayer({
  videoId,
  title,
  autoPlay = false,
  className,
}: YoutubeEmbedPlayerProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(autoPlay)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [ended, setEnded] = useState(false)

  const syncTime = useCallback(() => {
    const player = playerRef.current
    if (!player?.getCurrentTime || !player.getDuration) return
    const cur = player.getCurrentTime()
    const dur = player.getDuration()
    setCurrent(cur)
    setDuration(dur)
    if (dur > 0) setProgress((cur / dur) * 100)
  }, [])

  useEffect(() => {
    let destroyed = false
    let tick: ReturnType<typeof setInterval> | undefined

    void loadYoutubeIframeApi().then(() => {
      if (destroyed || !mountRef.current) return

      playerRef.current = new window.YT.Player(mountRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: autoPlay ? 1 : 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          disablekb: 1,
          controls: 0,
          iv_load_policy: 3,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          widget_referrer: window.location.origin,
        },
        events: {
          onReady: () => {
            if (destroyed) return
            setReady(true)
            syncTime()
            mountRef.current?.querySelector("iframe")?.setAttribute("tabindex", "-1")
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true)
              setEnded(false)
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setPlaying(false)
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setPlaying(false)
              setEnded(true)
            }
          },
        },
      })

      tick = setInterval(syncTime, 400)
    })

    return () => {
      destroyed = true
      if (tick) clearInterval(tick)
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [videoId, autoPlay, syncTime])

  const togglePlay = () => {
    const player = playerRef.current
    if (!player?.playVideo) return
    if (ended) {
      player.seekTo(0, true)
      player.playVideo()
      setEnded(false)
      return
    }
    if (playing) player.pauseVideo()
    else player.playVideo()
  }

  const toggleMute = () => {
    const player = playerRef.current
    if (!player) return
    if (muted) {
      player.unMute()
      setMuted(false)
    } else {
      player.mute()
      setMuted(true)
    }
  }

  const seek = (value: number[]) => {
    const player = playerRef.current
    if (!player?.getDuration) return
    const dur = player.getDuration()
    const t = (value[0] / 100) * dur
    player.seekTo(t, true)
    setProgress(value[0])
    setCurrent(t)
  }

  return (
    <div
      className={cn("flex w-full flex-col bg-black", className)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <div
          ref={mountRef}
          className="absolute inset-0 scale-[1.06] [&_iframe]:pointer-events-none [&_iframe]:h-full [&_iframe]:w-full"
          aria-hidden
        />
        {/* Blocks every click/hover on YouTube chrome, title, logo, end-screen links */}
        <div className="absolute inset-0 z-10" aria-hidden />
        {!playing && !autoPlay && ready && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/30"
            aria-label={ended ? `Replay ${title}` : `Play ${title}`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
              <Play className="ml-1 h-8 w-8" fill="currentColor" />
            </span>
          </button>
        )}
      </div>

      <div className="z-30 flex shrink-0 flex-col gap-2 border-t border-white/10 bg-black/95 p-3">
        <Slider
          value={[progress]}
          onValueChange={seek}
          max={100}
          step={0.1}
          className="cursor-pointer"
          disabled={!ready}
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={togglePlay}
              disabled={!ready}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause className="h-4 w-4" fill="currentColor" />
              ) : (
                <Play className="h-4 w-4" fill="currentColor" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={toggleMute}
              disabled={!ready}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <span className="text-xs text-white/80">
              {formatVideoTime(current)} / {formatVideoTime(duration)}
            </span>
          </div>
          <span className="truncate text-xs text-white/50">{title}</span>
        </div>
      </div>
    </div>
  )
}
