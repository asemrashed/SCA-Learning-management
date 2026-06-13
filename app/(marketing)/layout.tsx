import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="pt-6 md:pt-8" />
      <header className="sticky top-[10px] z-[100] px-4">
        <Navbar variant="floating" />
      </header>
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}
