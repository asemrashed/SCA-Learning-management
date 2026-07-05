"use client"

const WATERMARK_KEYFRAMES = `
  @keyframes pdfWatermarkDrift {
    0%   { top: 6%;  left: 4%;  transform: translate(0, 0) rotate(-18deg); }
    18%  { top: 6%;  left: 96%; transform: translate(-100%, 0) rotate(-18deg); }
    34%  { top: 50%; left: 84%; transform: translate(-100%, -50%) rotate(-18deg); }
    50%  { top: 92%; left: 96%; transform: translate(-100%, -100%) rotate(-18deg); }
    66%  { top: 92%; left: 4%;  transform: translate(0, -100%) rotate(-18deg); }
    82%  { top: 50%; left: 8%;  transform: translate(0, -50%) rotate(-18deg); }
    100% { top: 6%;  left: 4%;  transform: translate(0, 0) rotate(-18deg); }
  }
`

interface PdfViewerWatermarkProps {
  label: string
}

/** Traceable overlay for PDF canvas viewers — deterrent, not a security boundary. */
export function PdfViewerWatermark({ label }: PdfViewerWatermarkProps) {
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
            animation: "pdfWatermarkDrift 42s linear infinite",
            willChange: "top, left, transform",
          }}
        >
          <span className="block whitespace-nowrap text-sm font-semibold text-foreground/25">
            {label}
          </span>
        </div>
        <span className="absolute bottom-[8%] right-[4%] block whitespace-nowrap text-xs font-medium text-foreground/15">
          {label}
        </span>
        <span className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rotate-[-24deg] whitespace-nowrap text-4xl font-bold text-foreground/[0.06]">
          {label}
        </span>
      </div>
    </>
  )
}
