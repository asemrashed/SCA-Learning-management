"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { VideoPlayerShell } from "@/components/video-player-shell"

interface NativeFileVideoPlayerProps {
  src: string
  title: string
  autoPlay?: boolean
  flexible?: boolean
  variant?: "default" | "modal"
  className?: string
}

/** Self-hosted file player with custom controls — no native controls bar or download affordances. */
export function NativeFileVideoPlayer({
  src,
  title,
  autoPlay = false,
  flexible = false,
  variant = "default",
  className,
}: NativeFileVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(autoPlay)
  const [ended, setEnded] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [progress, setProgress] = useState(0)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)

  const syncTime = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const cur = video.currentTime
    const dur = video.duration
    if (Number.isFinite(dur)) {
      setCurrent(cur)
      setDuration(dur)
      if (dur > 0) setProgress((cur / dur) * 100)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onLoaded = () => {
      setReady(true)
      syncTime()
    }
    const onPlay = () => {
      setPlaying(true)
      setEnded(false)
    }
    const onPause = () => setPlaying(false)
    const onEnded = () => {
      setPlaying(false)
      setEnded(true)
    }
    const onTimeUpdate = () => syncTime()

    video.addEventListener("loadedmetadata", onLoaded)
    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)
    video.addEventListener("ended", onEnded)
    video.addEventListener("timeupdate", onTimeUpdate)

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded)
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("ended", onEnded)
      video.removeEventListener("timeupdate", onTimeUpdate)
    }
  }, [syncTime])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (ended) {
      video.currentTime = 0
      void video.play()
      setEnded(false)
      return
    }
    if (playing) video.pause()
    else void video.play()
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !muted
    setMuted(!muted)
  }

  const changeVolume = (v: number) => {
    const video = videoRef.current
    if (!video) return
    video.volume = v / 100
    video.muted = v === 0
    setVolume(v)
    setMuted(v === 0)
  }

  const seek = (value: number[]) => {
    const video = videoRef.current
    if (!video || !Number.isFinite(video.duration)) return
    const t = (value[0] / 100) * video.duration
    video.currentTime = t
    setProgress(value[0])
    setCurrent(t)
  }

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = rate
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
        <video
          ref={videoRef}
          src={src}
          className={cn("h-full w-full bg-black object-contain")}
          playsInline
          autoPlay={autoPlay}
          preload="metadata"
          controls={false}
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          aria-label={title}
        />
      }
    />
  )
}
