"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toYoutubeNoCookieSrc } from "@/lib/youtube"
import { VideoPlayerShell } from "@/components/video-player-shell"
import { VideoPrePlayOverlay } from "@/components/video-pre-play-overlay"

interface YoutubeEmbedPlayerProps {
  videoId: string
  title: string
  autoPlay?: boolean
  flexible?: boolean
  variant?: "default" | "modal"
  className?: string
  watermarkText?: string | null
}

/** Direct YouTube embed — used for recordings/fallback paths where only a video ID is available. */
export function YoutubeEmbedPlayer({
  videoId,
  title,
  autoPlay = false,
  flexible = false,
  variant = "default",
  className,
  watermarkText,
}: YoutubeEmbedPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [started, setStarted] = useState(autoPlay)
  const [playerReady, setPlayerReady] = useState(false)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [progress, setProgress] = useState(0)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [ended, setEnded] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [seeking, setSeeking] = useState(false)
  const pendingPlayRef = useRef(false)

  const sendPlayerCommand = useCallback(
    (func: string, args: unknown[] = []) => {
      if (!started) return
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "https://www.youtube-nocookie.com",
      )
    },
    [started],
  )

  const syncFromPlayer = useCallback(() => {
    sendPlayerCommand("getCurrentTime")
    sendPlayerCommand("getDuration")
  }, [sendPlayerCommand])

  const initializePlayerBridge = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: videoId }),
      "https://www.youtube-nocookie.com",
    )
    sendPlayerCommand("addEventListener", ["onReady"])
    sendPlayerCommand("addEventListener", ["onStateChange"])
    syncFromPlayer()
  }, [sendPlayerCommand, syncFromPlayer, videoId])

  useEffect(() => {
    if (!started) return

    function handleMessage(event: MessageEvent) {
      if (!event.origin.includes("youtube")) return

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data
        if (data?.event === "onReady") {
          setPlayerReady(true)
          setReady(true)
          syncFromPlayer()
          return
        }
        if (data?.event !== "infoDelivery") return

        const state = data?.info?.playerState
        if (state === 1) setPlaying(true)
        if (state === 0 || state === 2) setPlaying(false)
        if (state === 0) setEnded(true)

        const nextDuration = Number(data?.info?.duration)
        if (Number.isFinite(nextDuration) && nextDuration > 0) setDuration(nextDuration)

        const nextCurrentTime = Number(data?.info?.currentTime)
        if (!seeking && Number.isFinite(nextCurrentTime) && nextCurrentTime >= 0) {
          setCurrent(nextCurrentTime)
          if (nextDuration > 0) setProgress((nextCurrentTime / nextDuration) * 100)
        }
      } catch {
        // ignore non-JSON messages
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [started, seeking, syncFromPlayer])

  useEffect(() => {
    if (!started || !playerReady) return
    const tick = setInterval(syncFromPlayer, 400)
    return () => clearInterval(tick)
  }, [started, playerReady, syncFromPlayer])

  const beginPlayback = useCallback(() => {
    pendingPlayRef.current = true
    setStarted(true)
    setPlaying(true)
    setEnded(false)
  }, [])

  useEffect(() => {
    if (!started || !playerReady) return
    if (pendingPlayRef.current || autoPlay) {
      sendPlayerCommand("playVideo")
      pendingPlayRef.current = false
    }
  }, [started, playerReady, autoPlay, sendPlayerCommand])

  const togglePlay = () => {
    if (!started) {
      beginPlayback()
      return
    }
    if (ended) {
      sendPlayerCommand("seekTo", [0, true])
      sendPlayerCommand("playVideo")
      setEnded(false)
      setPlaying(true)
      return
    }
    if (playing) {
      sendPlayerCommand("pauseVideo")
      setPlaying(false)
    } else {
      sendPlayerCommand("playVideo")
      setPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!started) return
    if (muted) {
      sendPlayerCommand("unMute")
      setMuted(false)
    } else {
      sendPlayerCommand("mute")
      setMuted(true)
    }
  }

  const changeVolume = (v: number) => {
    if (!started) return
    sendPlayerCommand("setVolume", [v])
    if (v === 0) sendPlayerCommand("mute")
    else if (muted) sendPlayerCommand("unMute")
    setVolume(v)
    setMuted(v === 0)
  }

  const seek = (value: number[]) => {
    if (!started) return
    const t = duration > 0 ? (value[0] / 100) * duration : 0
    setSeeking(true)
    sendPlayerCommand("seekTo", [t, true])
    setProgress(value[0])
    setCurrent(t)
    window.setTimeout(() => setSeeking(false), 300)
  }

  const changePlaybackRate = (rate: number) => {
    if (!started) return
    sendPlayerCommand("setPlaybackRate", [rate])
    setPlaybackRate(rate)
  }

  const pauseOnHidden = useCallback(() => {
    sendPlayerCommand("pauseVideo")
    setPlaying(false)
  }, [sendPlayerCommand])

  const src = started ? toYoutubeNoCookieSrc(videoId, autoPlay) : undefined

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
      watermarkText={watermarkText}
      onTogglePlay={togglePlay}
      onToggleMute={toggleMute}
      onVolumeChange={changeVolume}
      onSeek={seek}
      onPlaybackRateChange={changePlaybackRate}
      onVisibilityHidden={started ? pauseOnHidden : undefined}
      videoArea={
        <>
          {!started ? (
            <VideoPrePlayOverlay title={title} onStart={beginPlayback} />
          ) : src ? (
            <>
              <iframe
                ref={iframeRef}
                key={videoId}
                title={title}
                src={src}
                className="pointer-events-none absolute inset-0 h-full w-full scale-[1.06] border-0"
                onLoad={() => {
                  window.setTimeout(initializePlayerBridge, 50)
                }}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                referrerPolicy="strict-origin-when-cross-origin"
                tabIndex={-1}
              />
              <div className="absolute inset-0 z-10" aria-hidden />
            </>
          ) : null}
        </>
      }
    />
  )
}
