import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { AppNotFound } from '@/components/status/app-not-found'

export default function ProfileNotFound() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto min-h-[60vh] px-4 py-8">
        <AppNotFound backHref="/dashboard" backLabel="Back to Dashboard" />
      </main>
      <Footer />
    </>
  )
}
