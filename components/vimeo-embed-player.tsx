"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Pause, Play, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { formatVideoTime } from "@/lib/video-url"
import { loadVimeoPlayerApi } from "@/lib/load-video-apis"

interface VimeoEmbedPlayerProps {
  videoId: string
  title: string
  autoPlay?: boolean
  className?: string
}

/** Vimeo player with iframe click-shield — no outbound clicks to vimeo.com. */
export function VimeoEmbedPlayer({
  videoId,
  title,
  autoPlay = false,
  className,
}: VimeoEmbedPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerRef = useRef<VimeoPlayer | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(autoPlay)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  const syncTime = useCallback(async () => {
    const player = playerRef.current
    if (!player) return
    const [cur, dur] = await Promise.all([player.getCurrentTime(), player.getDuration()])
    setCurrent(cur)
    setDuration(dur)
    if (dur > 0) setProgress((cur / dur) * 100)
  }, [])

  useEffect(() => {
    let destroyed = false
    let tick: ReturnType<typeof setInterval> | undefined

    void loadVimeoPlayerApi().then(() => {
      if (destroyed || !iframeRef.current) return

      const player = new window.Vimeo.Player(iframeRef.current)
      playerRef.current = player

      void player.ready().then(() => {
        if (destroyed) return
        setReady(true)
        void syncTime()
        if (autoPlay) void player.play()
      })

      player.on("play", () => setPlaying(true))
      player.on("pause", () => setPlaying(false))
      player.on("ended", () => setPlaying(false))

      tick = setInterval(() => void syncTime(), 400)
    })

    return () => {
      destroyed = true
      if (tick) clearInterval(tick)
      void playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [videoId, autoPlay, syncTime])

  const togglePlay = async () => {
    const player = playerRef.current
    if (!player) return
    if (playing) await player.pause()
    else await player.play()
  }

  const toggleMute = async () => {
    const player = playerRef.current
    if (!player) return
    if (muted) {
      await player.setMuted(false)
      setMuted(false)
    } else {
      await player.setMuted(true)
      setMuted(true)
    }
  }

  const seek = async (value: number[]) => {
    const player = playerRef.current
    if (!player) return
    const dur = await player.getDuration()
    const t = (value[0] / 100) * dur
    await player.setCurrentTime(t)
    setProgress(value[0])
    setCurrent(t)
  }

  const src = `https://player.vimeo.com/video/${videoId}?controls=0&title=0&byline=0&portrait=0&dnt=1&transparent=0${autoPlay ? "&autoplay=1" : ""}`

  return (
    <div
      className={cn("flex w-full flex-col bg-black", className)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          className="pointer-events-none absolute inset-0 h-full w-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          tabIndex={-1}
        />
        <div className="absolute inset-0 z-10" aria-hidden />
        {!playing && ready && (
          <button
            type="button"
            onClick={() => void togglePlay()}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/30"
            aria-label={`Play ${title}`}
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
          onValueChange={(v) => void seek(v)}
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
              onClick={() => void togglePlay()}
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
              onClick={() => void toggleMute()}
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
