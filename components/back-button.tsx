import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  href: string
  label: string
  className?: string
}

export function BackButton({ href, label, className }: BackButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      asChild
      className={cn(
        "rounded-lg border-border bg-secondary text-primary hover:bg-primary hover:text-primary-foreground",
        className,
      )}
    >
      <Link href={href}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  )
}
