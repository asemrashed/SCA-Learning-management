import Link from 'next/link'
import { cn } from '@/lib/utils'
import { marketingHeroSection, marketingWavePattern } from '@/lib/marketing-layout'

interface MarketingPageHeroProps {
  title: string
  description?: string
  breadcrumb?: string
  className?: string
  children?: React.ReactNode
}

export function MarketingPageHero({
  title,
  description,
  breadcrumb,
  className,
  children,
}: MarketingPageHeroProps) {
  return (
    <section
      className={marketingHeroSection(
        cn(
          'relative overflow-hidden bg-secondary pb-12 text-secondary-foreground md:pb-16',
          className,
        ),
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={marketingWavePattern}
      />
      <div className="container relative z-10 mx-auto px-4 text-center">
        {breadcrumb ? (
          <nav className="mb-4 flex justify-center space-x-2 text-sm text-secondary-foreground/60">
            <Link href="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <span className="text-secondary-foreground">{breadcrumb}</span>
          </nav>
        ) : null}
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary-foreground/80">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  )
}
