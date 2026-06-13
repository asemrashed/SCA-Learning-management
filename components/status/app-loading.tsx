import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppLoadingProps {
  message?: string
  className?: string
  fullScreen?: boolean
}

export function AppLoading({
  message = 'Loading…',
  className,
  fullScreen = true,
}: AppLoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 text-muted-foreground',
        fullScreen ? 'min-h-[50vh] px-6 py-16' : 'py-12',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}
