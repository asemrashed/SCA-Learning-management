"use client"

import { usePathname } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { getStaffBackHref, getStaffBackLabel } from "@/lib/staff-routes"

export function StaffBackBar() {
  const pathname = usePathname()
  const backHref = getStaffBackHref(pathname)
  const backLabel = backHref ? getStaffBackLabel(pathname) : null

  if (!backHref || !backLabel) return null

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 md:px-8">
      <BackButton href={backHref} label={`Back to ${backLabel}`} />
    </div>
  )
}
