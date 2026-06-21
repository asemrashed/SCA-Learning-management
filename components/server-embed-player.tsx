"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"
import {
  fetchLessonEmbedHtml,
  fetchLessonThumbnailBlob,
  revokeBlobUrl,
  type LessonPlayKind,
} from "@/lib/fetch-lesson-video"
import { VideoPlayerShell } from "@/components/video-player-shell"
import { VideoPrePlayOverlay } from "@/components/video-pre-play-overlay"

interface ServerEmbedPlayerProps {
  lessonId: string
  kind: Extract<LessonPlayKind, "youtube" | "vimeo">
  title: string
  autoPlay?: boolean
  flexible?: boolean
  variant?: "default" | "modal"
  className?: string
  watermarkText?: string | null
}

/** Loads embed HTML from the API (auth via fetch) and mounts it via srcDoc — YouTube/Vimeo URLs stay server-side. */
export function ServerEmbedPlayer({
  lessonId,
  kind,
  title,
  autoPlay = false,
  flexible = false,
  variant = "default",
  className,
  watermarkText,
}: ServerEmbedPlayerProps) {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const bridgeOrigin = typeof window !== "undefined" ? window.location.origin : ""
  const vimeoCmdIdRef = useRef(0)

  const [started, setStarted] = useState(autoPlay)
  const [embedHtml, setEmbedHtml] = useState<string | null>(null)
  const [loadingEmbed, setLoadingEmbed] = useState(false)
  const [embedError, setEmbedError] = useState<string | null>(null)
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null)
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

  useEffect(() => {
    let thumbUrl: string | null = null
    void fetchLessonThumbnailBlob(lessonId, accessToken).then((url) => {
      thumbUrl = url
      if (url) setThumbnailSrc(url)
    })
    return () => revokeBlobUrl(thumbUrl)
  }, [lessonId, accessToken])

  useEffect(() => {
    if (!started) return
    setLoadingEmbed(true)
    setEmbedError(null)
    setEmbedHtml(null)
    setPlayerReady(false)
    setReady(false)

    void fetchLessonEmbedHtml(lessonId, accessToken, autoPlay)
      .then((html) => {
        setEmbedHtml(html)
        setLoadingEmbed(false)
      })
      .catch(() => {
        setEmbedError("Could not load video")
        setLoadingEmbed(false)
      })
  }, [started, lessonId, accessToken, autoPlay])

  const sendYoutubeCommand = useCallback(
    (func: string, args: unknown[] = []) => {
      if (!started || !bridgeOrigin) return
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func, args }),
        bridgeOrigin,
      )
    },
    [started, bridgeOrigin],
  )

  const sendVimeoCommand = useCallback(
    (command: string, args: unknown[] = []) => {
      if (!started || !bridgeOrigin) return
      iframeRef.current?.contentWindow?.postMessage(
        { channel: "vimeo-bridge", command, args, id: ++vimeoCmdIdRef.current },
        bridgeOrigin,
      )
    },
    [started, bridgeOrigin],
  )

  const syncFromYoutube = useCallback(() => {
    sendYoutubeCommand("getCurrentTime")
    sendYoutubeCommand("getDuration")
  }, [sendYoutubeCommand])

  const syncFromVimeo = useCallback(() => {
    sendVimeoCommand("getCurrentTime")
    sendVimeoCommand("getDuration")
    sendVimeoCommand("getVolume")
  }, [sendVimeoCommand])

  const initializeYoutubeBridge = useCallback(() => {
    sendYoutubeCommand("addEventListener", ["onReady"])
    sendYoutubeCommand("addEventListener", ["onStateChange"])
    syncFromYoutube()
  }, [sendYoutubeCommand, syncFromYoutube])

  useEffect(() => {
    if (!started || kind !== "youtube") return

    function handleMessage(event: MessageEvent) {
      const fromBridge = event.origin === bridgeOrigin
      const fromYoutube = event.origin.includes("youtube")
      if (!fromBridge && !fromYoutube) return

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data
        if (data?.event === "onReady") {
          setPlayerReady(true)
          setReady(true)
          syncFromYoutube()
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
  }, [started, kind, seeking, syncFromYoutube, bridgeOrigin])

  useEffect(() => {
    if (!started || kind !== "vimeo") return

    function handleMessage(event: MessageEvent) {
      if (event.origin !== bridgeOrigin) return
      const data = event.data
      if (!data || typeof data !== "object") return

      if (data.channel === "vimeo-event") {
        if (data.event === "ready") {
          setPlayerReady(true)
          setReady(true)
          syncFromVimeo()
        }
        if (data.event === "play") {
          setPlaying(true)
          setEnded(false)
        }
        if (data.event === "pause") setPlaying(false)
        if (data.event === "ended") {
          setPlaying(false)
          setEnded(true)
        }
        return
      }

      if (data.channel === "vimeo-bridge" && data.result !== undefined) {
        if (typeof data.result === "number") {
          if (data.id && data.result >= 0 && data.result <= 1) {
            setVolume(Math.round(data.result * 100))
          } else if (data.result > 1) {
            setDuration(data.result)
          } else {
            setCurrent(data.result)
            if (duration > 0) setProgress((data.result / duration) * 100)
          }
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [started, kind, syncFromVimeo, bridgeOrigin, duration])

  useEffect(() => {
    if (!started || !playerReady) return
    const tick = setInterval(
      () => (kind === "youtube" ? syncFromYoutube() : syncFromVimeo()),
      400,
    )
    return () => clearInterval(tick)
  }, [started, playerReady, kind, syncFromYoutube, syncFromVimeo])

  const beginPlayback = useCallback(() => {
    pendingPlayRef.current = true
    setStarted(true)
    setPlaying(true)
    setEnded(false)
  }, [])

  useEffect(() => {
    if (!started || !playerReady || !embedHtml) return
    if (kind === "youtube") {
      window.setTimeout(initializeYoutubeBridge, 50)
    }
    if (pendingPlayRef.current || autoPlay) {
      if (kind === "youtube") sendYoutubeCommand("playVideo")
      else sendVimeoCommand("play")
      pendingPlayRef.current = false
    }
  }, [
    started,
    playerReady,
    embedHtml,
    autoPlay,
    kind,
    initializeYoutubeBridge,
    sendYoutubeCommand,
    sendVimeoCommand,
  ])

  const togglePlay = () => {
    if (!started) {
      beginPlayback()
      return
    }
    if (ended) {
      if (kind === "youtube") {
        sendYoutubeCommand("seekTo", [0, true])
        sendYoutubeCommand("playVideo")
      } else {
        sendVimeoCommand("setCurrentTime", [0])
        sendVimeoCommand("play")
      }
      setEnded(false)
      setPlaying(true)
      return
    }
    if (playing) {
      if (kind === "youtube") sendYoutubeCommand("pauseVideo")
      else sendVimeoCommand("pause")
      setPlaying(false)
    } else {
      if (kind === "youtube") sendYoutubeCommand("playVideo")
      else sendVimeoCommand("play")
      setPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!started) return
    if (kind === "youtube") {
      if (muted) {
        sendYoutubeCommand("unMute")
        setMuted(false)
      } else {
        sendYoutubeCommand("mute")
        setMuted(true)
      }
      return
    }
    sendVimeoCommand("setMuted", [!muted])
    setMuted(!muted)
  }

  const changeVolume = (v: number) => {
    if (!started) return
    if (kind === "youtube") {
      sendYoutubeCommand("setVolume", [v])
      if (v === 0) sendYoutubeCommand("mute")
      else if (muted) sendYoutubeCommand("unMute")
    } else {
      sendVimeoCommand("setVolume", [v / 100])
      sendVimeoCommand("setMuted", [v === 0])
    }
    setVolume(v)
    setMuted(v === 0)
  }

  const seek = (value: number[]) => {
    if (!started) return
    const t = duration > 0 ? (value[0] / 100) * duration : 0
    setSeeking(true)
    if (kind === "youtube") sendYoutubeCommand("seekTo", [t, true])
    else sendVimeoCommand("setCurrentTime", [t])
    setProgress(value[0])
    setCurrent(t)
    window.setTimeout(() => setSeeking(false), 300)
  }

  const changePlaybackRate = (rate: number) => {
    if (!started) return
    if (kind === "youtube") sendYoutubeCommand("setPlaybackRate", [rate])
    else sendVimeoCommand("setPlaybackRate", [rate])
    setPlaybackRate(rate)
  }

  const pauseOnHidden = useCallback(() => {
    if (kind === "youtube") sendYoutubeCommand("pauseVideo")
    else sendVimeoCommand("pause")
    setPlaying(false)
  }, [kind, sendYoutubeCommand, sendVimeoCommand])

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
            <VideoPrePlayOverlay
              title={title}
              thumbnailSrc={thumbnailSrc ?? undefined}
              onStart={beginPlayback}
            />
          ) : loadingEmbed ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
              Loading video…
            </div>
          ) : embedError ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
              {embedError}
            </div>
          ) : embedHtml ? (
            <>
              <iframe
                ref={iframeRef}
                key={lessonId}
                title={title}
                srcDoc={embedHtml}
                className="pointer-events-none absolute inset-0 h-full w-full scale-[1.06] border-0"
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
