"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  Video,
  FileText,
  User,
  Settings,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { BRAND_NAME, BRAND_SHORT } from "@/lib/brand"

const sidebarItems = [
  {
    group: "Learning",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
      { href: "/dashboard/recordings", label: "Recordings", icon: Video },
      { href: "/dashboard/resources", label: "Resources", icon: FileText },
    ],
  },
  {
    group: "Account",
    items: [
      { href: "/profile", label: "Profile", icon: User },
      { href: "/dashboard/certificates", label: "Certificates", icon: GraduationCap },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
]

interface DashboardSidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "sticky top-16 flex h-[calc(100vh-4rem)] flex-col border-r border-border bg-card transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Toggle Button */}
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

      {/* Logo/Brand */}
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {sidebarItems.map((group) => (
            <div key={group.group}>
              {!isCollapsed && (
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.group}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        isCollapsed && "justify-center"
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

      {/* Special Links */}
      <div className="border-t border-border p-4">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 p-4">
              <div className="mb-2 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Study Abroad</span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Get free counseling for international education
              </p>
              <Button size="sm" className="w-full rounded-lg text-xs">
                Learn More
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full text-muted-foreground hover:text-destructive",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </aside>
  )
}
