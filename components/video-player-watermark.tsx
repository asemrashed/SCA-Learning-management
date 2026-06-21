"use client"

const WATERMARK_KEYFRAMES = `
  @keyframes videoWatermarkDrift {
    0%   { top: 6%;  left: 4%;  transform: translate(0, 0); }
    18%  { top: 6%;  left: 96%; transform: translate(-100%, 0); }
    34%  { top: 50%; left: 84%; transform: translate(-100%, -50%); }
    50%  { top: 92%; left: 96%; transform: translate(-100%, -100%); }
    66%  { top: 92%; left: 4%;  transform: translate(0, -100%); }
    82%  { top: 50%; left: 8%;  transform: translate(0, -50%); }
    100% { top: 6%;  left: 4%;  transform: translate(0, 0); }
  }
`

interface VideoPlayerWatermarkProps {
  label: string
}

/** Social deterrent overlay — visible in screen recordings, not a security boundary. */
export function VideoPlayerWatermark({ label }: VideoPlayerWatermarkProps) {
  return (
    <>
      <style>{WATERMARK_KEYFRAMES}</style>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[15] select-none overflow-hidden"
      >
        <div
          className="absolute"
          style={{
            animation: "videoWatermarkDrift 42s linear infinite",
            willChange: "top, left, transform",
          }}
        >
          <span
            className="block whitespace-nowrap rounded px-2 py-1 text-xs font-medium text-white"
            style={{ opacity: 0.35, textShadow: "0 1px 4px rgba(0,0,0,0.85)" }}
          >
            {label}
          </span>
        </div>
        <span
          className="absolute bottom-[8%] right-[4%] block whitespace-nowrap rounded px-2 py-1 text-xs font-medium text-white"
          style={{ opacity: 0.15, textShadow: "0 1px 4px rgba(0,0,0,0.85)" }}
        >
          {label}
        </span>
      </div>
    </>
  )
}
