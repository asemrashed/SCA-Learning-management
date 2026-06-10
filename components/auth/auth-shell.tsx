import Image from 'next/image'
import Link from 'next/link'
import { BRAND_NAME, BRAND_SHORT } from '@/lib/brand'

interface AuthShellProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="flex min-h-screen w-full flex-col overflow-hidden bg-white text-secondary lg:flex-row">
      {/* Left — illustration & branding */}
      <section className="relative hidden w-full flex-col items-center justify-center overflow-hidden border-r border-gray-100 bg-[#f2fdfb] p-8 lg:flex lg:w-[45%] xl:w-1/2 lg:p-16">
        <div className="absolute right-24 top-24 h-4 w-4 rounded-full bg-primary opacity-60" />
        <div className="absolute left-16 top-1/3 h-3 w-3 rounded-full bg-[#f9c58d] opacity-80" />
        <div className="absolute bottom-32 left-20 h-5 w-5 rounded-full bg-primary opacity-40" />
        <div className="absolute bottom-1/4 right-1/4 h-2 w-2 rounded-full bg-[#f9c58d] opacity-90" />
        <div className="absolute bottom-12 right-12 h-6 w-6 rounded-full bg-primary opacity-30" />

        <header className="absolute left-8 top-8 z-20 flex items-center gap-3 lg:left-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-sm">
              <div className="absolute right-1 top-1 h-5 w-5 rounded-full bg-[#f2fdfb] opacity-80" />
              <span className="relative z-10 text-sm font-bold text-primary-foreground">{BRAND_SHORT}</span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xs font-semibold uppercase leading-tight tracking-wider text-gray-500">
                eLearning
              </span>
              <span className="text-xl font-bold leading-tight text-secondary">{BRAND_SHORT}</span>
            </div>
          </Link>
        </header>

        <div className="relative z-10 mt-12 flex w-full max-w-lg items-center justify-center">
          <Image
            src="/loginHero.png"
            alt="Online learning illustration"
            width={560}
            height={400}
            className="h-auto max-h-[400px] w-full object-contain"
            priority
          />
        </div>

        <div className="relative z-10 mt-12 max-w-md text-center">
          <h2 className="mb-4 text-2xl font-bold text-secondary lg:text-3xl">
            Learn live. Grow with {BRAND_SHORT}.
          </h2>
          <p className="text-sm leading-relaxed text-gray-500 lg:text-base">
            Join batch-based courses built for the Bangladesh market — live classes, recordings,
            and expert instructors from {BRAND_NAME}.
          </p>
        </div>
      </section>

      {/* Right — form */}
      <section className="relative flex w-full items-center justify-center bg-white p-6 sm:p-12 lg:w-[55%] lg:p-20 xl:w-1/2">
        <div className="absolute left-10 top-20 hidden h-4 w-4 rounded-full bg-[#f9c58d] opacity-50 md:block" />
        <div className="absolute bottom-20 right-10 hidden h-3 w-3 rounded-full bg-primary opacity-40 md:block" />
        <div className="absolute right-12 top-1/2 hidden h-2 w-2 rounded-full bg-gray-200 md:block" />

        <div className="z-10 w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Link href="/" className="mb-6 inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <span className="text-sm font-bold text-primary-foreground">{BRAND_SHORT}</span>
              </div>
              <span className="font-bold text-secondary">{BRAND_NAME}</span>
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="mb-3 text-3xl font-bold text-secondary sm:text-4xl">{title}</h1>
            <p className="text-sm text-gray-500 sm:text-base">{subtitle}</p>
          </div>

          {children}

          {footer && <div className="mt-10 text-center text-sm text-gray-500">{footer}</div>}
        </div>
      </section>
    </main>
  )
}
