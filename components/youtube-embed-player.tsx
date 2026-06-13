"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { loadYoutubeIframeApi } from "@/lib/load-video-apis"
import { VideoPlayerShell } from "@/components/video-player-shell"

interface YoutubeEmbedPlayerProps {
  videoId: string
  title: string
  autoPlay?: boolean
  flexible?: boolean
  variant?: "default" | "modal"
  className?: string
}

/** YouTube player with iframe click-shield — users cannot reach YouTube UI or outbound links. */
export function YoutubeEmbedPlayer({
  videoId,
  title,
  autoPlay = false,
  flexible = false,
  variant = "default",
  className,
}: YoutubeEmbedPlayerProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(autoPlay)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [progress, setProgress] = useState(0)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [ended, setEnded] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

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
            const vol = playerRef.current?.getVolume?.()
            if (typeof vol === "number") setVolume(vol)
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

  const changeVolume = (v: number) => {
    const player = playerRef.current
    if (!player?.setVolume) return
    player.setVolume(v)
    if (v === 0) player.mute()
    else if (muted) player.unMute()
    setVolume(v)
    setMuted(v === 0)
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

  const changePlaybackRate = (rate: number) => {
    const player = playerRef.current
    if (!player?.setPlaybackRate) return
    player.setPlaybackRate(rate)
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
      onTogglePlay={togglePlay}
      onToggleMute={toggleMute}
      onVolumeChange={changeVolume}
      onSeek={seek}
      onPlaybackRateChange={changePlaybackRate}
      videoArea={
        <>
          <div
            ref={mountRef}
            className={cn(
              "absolute inset-0 scale-[1.06] [&_iframe]:pointer-events-none [&_iframe]:h-full [&_iframe]:w-full",
            )}
            aria-hidden
          />
          <div className="absolute inset-0 z-10" aria-hidden />
        </>
      }
    />
  )
}
