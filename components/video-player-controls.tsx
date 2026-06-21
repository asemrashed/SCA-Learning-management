"use client"

import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { formatVideoTime } from "@/lib/video-url"

export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const

interface VideoPlayerControlsProps {
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
  isFullscreen: boolean
  visible?: boolean
  variant?: "default" | "modal"
  menuPortalContainer?: HTMLElement | null
  onTogglePlay: () => void
  onToggleMute: () => void
  onVolumeChange: (volume: number) => void
  onSeek: (value: number[]) => void
  onPlaybackRateChange: (rate: number) => void
  onToggleFullscreen: () => void
  onMenuOpenChange?: (open: boolean) => void
  onMouseEnterControls?: () => void
  onMouseLeaveControls?: () => void
  className?: string
}

export function VideoPlayerControls({
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
  isFullscreen,
  visible = true,
  variant = "default",
  menuPortalContainer,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onSeek,
  onPlaybackRateChange,
  onToggleFullscreen,
  onMenuOpenChange,
  onMouseEnterControls,
  onMouseLeaveControls,
  className,
}: VideoPlayerControlsProps) {
  return (
    <div
      className={cn(
        "z-30 flex shrink-0 flex-col gap-2 border-t border-white/10 bg-black/95 p-3 transition-opacity duration-300",
        !visible && "pointer-events-none opacity-0",
        className,
      )}
      onMouseEnter={onMouseEnterControls}
      onMouseLeave={onMouseLeaveControls}
    >
      <Slider
        value={[progress]}
        onValueChange={onSeek}
        max={100}
        step={0.1}
        className="cursor-pointer"
        disabled={!ready}
        aria-label="Seek"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-white hover:bg-white/20"
            onClick={onTogglePlay}
            disabled={!ready}
            aria-label={ended ? "Replay" : playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause className="h-4 w-4" fill="currentColor" />
            ) : (
              <Play className="h-4 w-4" fill="currentColor" />
            )}
          </Button>

          <div className="hidden items-center gap-1 sm:flex">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-white hover:bg-white/20"
              onClick={onToggleMute}
              disabled={!ready}
              aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[muted ? 0 : volume]}
              onValueChange={(v) => onVolumeChange(v[0])}
              max={100}
              step={1}
              className="w-20 cursor-pointer"
              disabled={!ready}
              aria-label="Volume"
            />
          </div>

          <span className="shrink-0 text-xs text-white/80 tabular-nums">
            {formatVideoTime(current)} / {formatVideoTime(duration)}
          </span>
        </div>

        <span className="hidden max-w-[28%] truncate text-xs text-white/50 md:inline">
          {title}
        </span>

        <div className="flex shrink-0 items-center gap-0.5">
          <DropdownMenu modal={false} onOpenChange={onMenuOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                disabled={!ready}
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              container={isFullscreen ? menuPortalContainer : undefined}
              className={cn(
                "w-44",
                (variant === "modal" || isFullscreen) && "z-[130]",
              )}
            >
              <DropdownMenuLabel>Playback speed</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={String(playbackRate)}
                onValueChange={(v) => onPlaybackRateChange(Number(v))}
              >
                {PLAYBACK_RATES.map((rate) => (
                  <DropdownMenuRadioItem key={rate} value={String(rate)}>
                    {rate === 1 ? "Normal" : `${rate}x`}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={onToggleFullscreen}
            disabled={!ready}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
