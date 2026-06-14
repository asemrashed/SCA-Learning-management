"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Role } from "@/types/api"
import { AppShell, type AppShellVariant } from "@/components/app-shell"

interface StaffShellProps {
  children: React.ReactNode
}

export function StaffShell({ children }: StaffShellProps) {
  const user = useSelector((state: RootState) => state.auth.user)
  const variant: AppShellVariant =
    user?.role === Role.SUPER_ADMIN ? "super-admin" : "admin"

  return <AppShell variant={variant}>{children}</AppShell>
}
