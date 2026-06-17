"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useStaffShell } from "@/components/staff/staff-shell-context"

interface StaffPageShellProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function StaffPageShell({ title, children, className }: StaffPageShellProps) {
  const { toggleSidebar } = useStaffShell()

  return (
    <div className={cn("mx-auto w-full max-w-6xl p-4 md:p-8", className)}>
      <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={toggleSidebar}
            className="rounded-lg bg-primary px-4 text-secondary hover:bg-primary/90"
          >
            <Menu className="mr-2 h-4 w-4" />
            Menu
          </Button>
          <h2 className="text-xl font-bold text-foreground md:text-2xl">{title}</h2>
        </div>

        {children}
      </div>
    </div>
  )
}
