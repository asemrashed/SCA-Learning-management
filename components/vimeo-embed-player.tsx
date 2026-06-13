"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { loadVimeoPlayerApi } from "@/lib/load-video-apis"
import { VideoPlayerShell } from "@/components/video-player-shell"

interface VimeoEmbedPlayerProps {
  videoId: string
  title: string
  autoPlay?: boolean
  flexible?: boolean
  variant?: "default" | "modal"
  className?: string
}

/** Vimeo player with iframe click-shield — no outbound clicks to vimeo.com. */
export function VimeoEmbedPlayer({
  videoId,
  title,
  autoPlay = false,
  flexible = false,
  variant = "default",
  className,
}: VimeoEmbedPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerRef = useRef<VimeoPlayer | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(autoPlay)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [progress, setProgress] = useState(0)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [ended, setEnded] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

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

      iframeRef.current.src = `https://player.vimeo.com/video/${videoId}?controls=0&title=0&byline=0&portrait=0&dnt=1&transparent=0${autoPlay ? "&autoplay=1" : ""}`

      const player = new window.Vimeo.Player(iframeRef.current)
      playerRef.current = player

      void player.ready().then(async () => {
        if (destroyed) return
        setReady(true)
        void syncTime()
        const vol = await player.getVolume()
        setVolume(Math.round(vol * 100))
        if (autoPlay) void player.play()
      })

      player.on("play", () => {
        setPlaying(true)
        setEnded(false)
      })
      player.on("pause", () => setPlaying(false))
      player.on("ended", () => {
        setPlaying(false)
        setEnded(true)
      })

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
    if (ended) {
      await player.setCurrentTime(0)
      await player.play()
      setEnded(false)
      return
    }
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

  const changeVolume = async (v: number) => {
    const player = playerRef.current
    if (!player) return
    await player.setVolume(v / 100)
    if (v === 0) await player.setMuted(true)
    else if (muted) await player.setMuted(false)
    setVolume(v)
    setMuted(v === 0)
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

  const changePlaybackRate = async (rate: number) => {
    const player = playerRef.current
    if (!player?.setPlaybackRate) return
    await player.setPlaybackRate(rate)
    setPlaybackRate(rate)
  }

  return (
    <VideoPlayerShell
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
      autoPlay={autoPlay}
      flexible={flexible}
      variant={variant}
      className={className}
      onTogglePlay={() => void togglePlay()}
      onToggleMute={() => void toggleMute()}
      onVolumeChange={(v) => void changeVolume(v)}
      onSeek={(v) => void seek(v)}
      onPlaybackRateChange={(r) => void changePlaybackRate(r)}
      videoArea={
        <>
          <iframe
            ref={iframeRef}
            title={title}
            className="pointer-events-none absolute inset-0 h-full w-full border-0"
            allow="autoplay; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={-1}
          />
          <div className="absolute inset-0 z-10" aria-hidden />
        </>
      }
    />
  )
}
