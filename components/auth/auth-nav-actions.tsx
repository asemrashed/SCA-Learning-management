'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { LayoutDashboard, LogOut } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useLogoutMutation } from '@/features/auth/api'
import { clearCredentials } from '@/features/auth/authSlice'
import { clearSessionCookie } from '@/lib/auth-session'
import type { RootState } from '@/store/rootReducer'
import { homePathForRole } from '@/lib/dashboard-nav'

interface AuthNavActionsProps {
  floating?: boolean
  className?: string
  onNavigate?: () => void
  layout?: 'desktop' | 'mobile'
}

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function AuthNavActions({
  floating = false,
  className,
  onNavigate,
  layout = 'desktop',
}: AuthNavActionsProps) {
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const [logout, { isLoading }] = useLogoutMutation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch {
      // Still clear local session if API fails
    }
    dispatch(clearCredentials())
    clearSessionCookie()
    setMenuOpen(false)
    onNavigate?.()
    router.push('/login')
    router.refresh()
  }

  useEffect(() => {
    if (!menuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  if (user) {
    const dashboardHref = homePathForRole(user.role)

    if (layout === 'mobile') {
      return (
        <div className={cn('flex w-full max-w-xs flex-col items-center gap-3', className)}>
          <Button
            variant={floating ? 'outline' : 'default'}
            className={cn(
              'w-full rounded-xl',
              floating && 'border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white',
            )}
            asChild
          >
            <Link href={dashboardHref} onClick={onNavigate}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button
            variant={floating ? 'default' : 'outline'}
            className={cn(
              'w-full rounded-xl',
              floating && 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
            disabled={isLoading}
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      )
    }

    const drawerBg = floating
      ? 'bg-secondary border-white/20 text-white'
      : 'border-border bg-card/95 text-foreground backdrop-blur-md'

    return (
      <div ref={menuRef} className={cn('relative', className)}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-full outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open account menu"
          aria-expanded={menuOpen}
        >
          <Avatar
            className={cn(
              'h-9 w-9 border-2 md:h-10 md:w-10',
              floating ? 'border-white/30' : 'border-border',
            )}
          >
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
            <AvatarFallback
              className={cn(
                'text-sm font-semibold',
                floating ? 'bg-white/10 text-white' : 'bg-primary/10 text-primary',
              )}
            >
              {userInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className={cn(
                'absolute right-0 top-full z-[110] mt-0 w-52 overflow-hidden rounded-t-none rounded-b-xl border border-t-0 shadow-lg',
                drawerBg,
              )}
            >
              <div className="flex flex-col p-2">
                <Link
                  href={dashboardHref}
                  onClick={() => {
                    setMenuOpen(false)
                    onNavigate?.()
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    floating
                      ? 'text-white/90 hover:bg-white/10 hover:text-white'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleLogout}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors disabled:opacity-50',
                    floating
                      ? 'text-destructive hover:bg-white/10'
                      : 'text-destructive hover:bg-destructive/10',
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Button
      className={cn(
        'rounded-full px-5',
        floating
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'rounded-xl bg-primary hover:bg-primary/90',
        layout === 'mobile' && 'w-full max-w-xs',
        className,
      )}
      asChild
    >
      <Link href="/login" onClick={onNavigate}>
        Login / Sign Up
      </Link>
    </Button>
  )
}
