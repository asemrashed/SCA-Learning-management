import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppNotFoundProps {
  title?: string
  description?: string
  backHref?: string
  backLabel?: string
}

export function AppNotFound({
  title = 'Page not found',
  description = "The page you're looking for doesn't exist or may have been moved.",
  backHref = '/',
  backLabel = 'Back to Home',
}: AppNotFoundProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <FileQuestion className="h-8 w-8 text-primary" aria-hidden />
      </div>
      <h1 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
      <p className="mb-8 max-w-md text-muted-foreground">{description}</p>
      <Button asChild className="rounded-xl">
        <Link href={backHref}>
          <Home className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>
      </Button>
    </div>
  )
}
