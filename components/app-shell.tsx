"use client"

import { StaffHeader } from "@/components/staff/staff-header"
import { StaffShellProvider } from "@/components/staff/staff-shell-context"
import { StaffSidebar } from "@/components/staff/staff-sidebar"
import { StudentHeader } from "@/components/student/student-header"
import { StudentSidebar } from "@/components/student/student-sidebar"
import { StudentShellProvider } from "@/components/student/student-shell-context"
import {
  adminShellNav,
  instructorShellNav,
  superAdminShellNav,
  type ShellNavGroup,
} from "@/lib/dashboard-nav"

export type AppShellVariant = "student" | "admin" | "super-admin" | "instructor"

const navByVariant: Record<Exclude<AppShellVariant, "student">, ShellNavGroup[]> = {
  admin: adminShellNav,
  "super-admin": superAdminShellNav,
  instructor: instructorShellNav,
}

const overviewHrefByVariant: Record<Exclude<AppShellVariant, "student">, string> = {
  admin: "/admin",
  "super-admin": "/super-admin",
  instructor: "/instructor",
}

interface AppShellProps {
  variant: AppShellVariant
  children: React.ReactNode
  clientIp?: string
}

function StaffAppShell({
  variant,
  children,
}: {
  variant: Exclude<AppShellVariant, "student">
  children: React.ReactNode
}) {
  const nav = navByVariant[variant]
  const overviewHref = overviewHrefByVariant[variant]

  return (
    <StaffShellProvider>
      <div className="flex min-h-screen bg-muted/30">
        <StaffSidebar nav={nav} overviewHref={overviewHref} />
        <div className="flex min-w-0 flex-1 flex-col">
          <StaffHeader />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </StaffShellProvider>
  )
}

function StudentAppShellInner({
  children,
  clientIp,
}: {
  children: React.ReactNode
  clientIp?: string
}) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <StudentSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <StudentHeader clientIp={clientIp} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

export function AppShell({ variant, children, clientIp }: AppShellProps) {
  if (variant === "student") {
    return (
      <StudentShellProvider>
        <StudentAppShellInner clientIp={clientIp}>{children}</StudentAppShellInner>
      </StudentShellProvider>
    )
  }

  return <StaffAppShell variant={variant}>{children}</StaffAppShell>
}
