"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BRAND_NAME, BRAND_SHORT } from "@/lib/brand"
import {
  adminShellNav,
  instructorShellNav,
  studentShellNav,
  type ShellNavGroup,
} from "@/lib/dashboard-nav"
import { useLogoutMutation } from "@/features/auth/api"
import { clearCredentials } from "@/features/auth/authSlice"
import { clearSessionCookie } from "@/lib/auth-session"

export type AppShellVariant = "student" | "admin" | "instructor"

const navByVariant: Record<AppShellVariant, ShellNavGroup[]> = {
  student: studentShellNav,
  admin: adminShellNav,
  instructor: instructorShellNav,
}

interface AppShellProps {
  variant: AppShellVariant
  children: React.ReactNode
}

export function AppShell({ variant, children }: AppShellProps) {
  const nav = navByVariant[variant]
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch()
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (href: string) =>
    href === pathname || (href !== "/" && pathname.startsWith(`${href}/`))

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
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-border bg-card shadow-sm"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        <div className="flex h-16 items-center border-b border-border px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
              <span className="text-lg font-bold text-primary-foreground">{BRAND_SHORT}</span>
            </div>
            {!isCollapsed && (
              <span className="text-sm font-bold leading-tight text-foreground">{BRAND_NAME}</span>
            )}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {nav.map((group) => (
              <div key={group.group}>
                {!isCollapsed && (
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
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          isCollapsed && "justify-center",
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span>{item.label}</span>}
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
              isCollapsed ? "justify-center" : "justify-start",
            )}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
