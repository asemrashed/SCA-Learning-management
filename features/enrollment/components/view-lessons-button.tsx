import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ViewLessonsButtonProps {
  href: string
  className?: string
}

export function ViewLessonsButton({ href, className }: ViewLessonsButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700",
        className,
      )}
    >
      View lessons
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}
