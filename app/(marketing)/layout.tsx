import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-4 z-[100] px-4">
        <Navbar variant="floating" />
      </header>
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}
