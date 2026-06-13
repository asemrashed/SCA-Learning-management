'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  description?: string
  backHref?: string
  backLabel?: string
}

export function AppError({
  error,
  reset,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again or return home.',
  backHref = '/',
  backLabel = 'Back to Home',
}: AppErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden />
      </div>
      <h1 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
      <p className="mb-8 max-w-md text-muted-foreground">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} className="rounded-xl">
          <RotateCcw className="mr-2 h-4 w-4" />
          Try again
        </Button>
        <Button variant="outline" asChild className="rounded-xl">
          <Link href={backHref}>
            <Home className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
      </div>
    </div>
  )
}
