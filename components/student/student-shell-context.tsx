"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

interface StudentShellContextValue {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggleSidebar: () => void
  closeMobileSidebar: () => void
  expandSidebar: () => void
  collapseSidebar: () => void
}

const StudentShellContext = createContext<StudentShellContextValue | null>(null)

export function StudentShellProvider({ children }: { children: React.ReactNode }) {
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
    <StudentShellContext.Provider
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
    </StudentShellContext.Provider>
  )
}

export function useStudentShell() {
  const ctx = useContext(StudentShellContext)
  if (!ctx) {
    throw new Error("useStudentShell must be used within StudentShellProvider")
  }
  return ctx
}
