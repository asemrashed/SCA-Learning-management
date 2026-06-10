'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLogoutMutation } from '@/features/auth/api'
import { clearCredentials } from '@/features/auth/authSlice'
import { clearSessionCookie } from '@/lib/auth-session'
import type { RootState } from '@/store/rootReducer'

interface AuthNavActionsProps {
  floating?: boolean
  className?: string
  onNavigate?: () => void
}

export function AuthNavActions({ floating = false, className, onNavigate }: AuthNavActionsProps) {
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const [logout, { isLoading }] = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch {
      // Still clear local session if API fails
    }
    dispatch(clearCredentials())
    clearSessionCookie()
    onNavigate?.()
    router.push('/login')
    router.refresh()
  }

  if (user) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant={floating ? 'outline' : 'ghost'}
          className={cn(
            'rounded-xl',
            floating && 'border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white',
          )}
          asChild
        >
          <Link href="/dashboard" onClick={onNavigate}>
            {user.name.split(' ')[0]}
          </Link>
        </Button>
        <Button
          variant={floating ? 'default' : 'outline'}
          className={cn(
            'rounded-xl',
            floating && 'bg-primary text-primary-foreground hover:bg-primary/90',
          )}
          disabled={isLoading}
          onClick={handleLogout}
        >
          Logout
        </Button>
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
