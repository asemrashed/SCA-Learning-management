"use client"

import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { getStaffBackHref, getStaffBackLabel } from "@/lib/staff-routes"
import { useStaffShell } from "@/components/staff/staff-shell-context"

export function StaffBackBar() {
  const pathname = usePathname()
  const { toggleSidebar } = useStaffShell()
  const backHref = getStaffBackHref(pathname)
  const backLabel = backHref ? getStaffBackLabel(pathname) : null

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 md:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={toggleSidebar}
          className="rounded-lg bg-primary px-4 text-secondary hover:bg-primary/90"
        >
          <Menu className="mr-2 h-4 w-4" />
          Menu
        </Button>
        {backHref && backLabel ? (
          <BackButton href={backHref} label={`Back to ${backLabel}`} />
        ) : null}
      </div>
    </div>
  )
}
