"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, LogOut, X } from "lucide-react"
import { useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BRAND_NAME, BRAND_SHORT } from "@/lib/brand"
import type { ShellNavGroup } from "@/lib/dashboard-nav"
import { useLogoutMutation } from "@/features/auth/api"
import { clearCredentials } from "@/features/auth/authSlice"
import { clearSessionCookie } from "@/lib/auth-session"
import { useStaffShell } from "@/components/staff/staff-shell-context"

interface StaffSidebarProps {
  nav: ShellNavGroup[]
  overviewHref: string
}

interface SidebarNavProps {
  nav: ShellNavGroup[]
  overviewHref: string
  expanded: boolean
  onNavigate?: () => void
  onClose?: () => void
}

function SidebarNav({ nav, overviewHref, expanded, onNavigate, onClose }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch()
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation()

  const isActive = (href: string) => {
    if (href === overviewHref) return pathname === overviewHref
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch {
      // Clear local session even if API fails
    }
    dispatch(clearCredentials())
    clearSessionCookie()
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2" onClick={onNavigate}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
            <span className="text-lg font-bold text-secondary">{BRAND_SHORT}</span>
          </div>
          {expanded && (
            <span className="truncate text-sm font-bold leading-tight text-foreground">
              {BRAND_NAME}
            </span>
          )}
        </Link>
        {onClose ? (
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {nav.map((group) => (
            <div key={group.group}>
              {expanded && (
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.group}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-secondary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        !expanded && "justify-center px-2",
                        !expanded && active && "rounded-full",
                      )}
                      title={!expanded ? item.label : undefined}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {expanded && <span>{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          disabled={isLoggingOut}
          onClick={handleLogout}
          className={cn(
            "w-full text-muted-foreground hover:text-destructive",
            !expanded ? "justify-center" : "justify-start",
          )}
        >
          <LogOut className="h-5 w-5" />
          {expanded && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </>
  )
}

export function StaffSidebar({ nav, overviewHref }: StaffSidebarProps) {
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobileSidebar } = useStaffShell()

  return (
    <>
      <div className="md:hidden">
        <div
          className={cn(
            "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300",
            isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={closeMobileSidebar}
          aria-hidden={!isMobileOpen}
        />
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-card shadow-xl transition-transform duration-300 ease-out",
            isMobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
          aria-hidden={!isMobileOpen}
        >
          <SidebarNav
            nav={nav}
            overviewHref={overviewHref}
            expanded
            onNavigate={closeMobileSidebar}
            onClose={closeMobileSidebar}
          />
        </aside>
      </div>

      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-all duration-300 md:flex",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-border bg-card shadow-sm"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        <SidebarNav nav={nav} overviewHref={overviewHref} expanded={!isCollapsed} />
      </aside>
    </>
  )
}
