"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

interface StaffShellContextValue {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggleSidebar: () => void
  closeMobileSidebar: () => void
  expandSidebar: () => void
  collapseSidebar: () => void
}

const StaffShellContext = createContext<StaffShellContextValue | null>(null)

export function StaffShellProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen((v) => !v)
    } else {
      setIsCollapsed((v) => !v)
    }
  }, [isMobile])

  const closeMobileSidebar = useCallback(() => setIsMobileOpen(false), [])
  const expandSidebar = useCallback(() => setIsCollapsed(false), [])
  const collapseSidebar = useCallback(() => setIsCollapsed(true), [])

  useEffect(() => {
    if (!isMobile) setIsMobileOpen(false)
  }, [isMobile])

  return (
    <StaffShellContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        toggleSidebar,
        closeMobileSidebar,
        expandSidebar,
        collapseSidebar,
      }}
    >
      {children}
    </StaffShellContext.Provider>
  )
}

export function useStaffShell() {
  const ctx = useContext(StaffShellContext)
  if (!ctx) {
    throw new Error("useStaffShell must be used within StaffShellProvider")
  }
  return ctx
}
