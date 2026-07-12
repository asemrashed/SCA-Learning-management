"use client"

import { Button } from "@/components/ui/button"
import { Facebook } from "lucide-react"

export function ShareButtons() {
  const handleShare = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href)
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        "_blank",
        "noopener,noreferrer"
      )
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full rounded-xl flex items-center justify-center gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
      onClick={handleShare}
    >
      <Facebook className="h-4 w-4 fill-current" />
      Share on Facebook
    </Button>
  )
}
