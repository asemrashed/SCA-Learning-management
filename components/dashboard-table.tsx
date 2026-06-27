import { cn } from "@/lib/utils"

interface DashboardTableProps {
  children: React.ReactNode
  className?: string
}

export function DashboardTable({ children, className }: DashboardTableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border scrollbar-slim", className)}>
      {children}
    </div>
  )
}
