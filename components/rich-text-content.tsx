import { cn } from "@/lib/utils"

interface RichTextContentProps {
  html: string
  className?: string
}

/** True when content looks like HTML from TipTap (not plain text). */
export function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value.trim())
}

export function RichTextContent({ html, className }: RichTextContentProps) {
  const trimmed = html.trim()
  if (!trimmed) return null

  if (!looksLikeHtml(trimmed)) {
    return (
      <div className={cn("rich-text-content whitespace-pre-wrap", className)}>{trimmed}</div>
    )
  }

  return (
    <div
      className={cn("rich-text-content", className)}
      dangerouslySetInnerHTML={{ __html: trimmed }}
    />
  )
}
