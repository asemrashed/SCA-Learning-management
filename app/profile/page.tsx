import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ComingSoonPage } from "@/components/coming-soon-page"

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto min-h-[60vh] px-4 py-8">
        <ComingSoonPage
          title="Profile"
          description="Your profile settings will be available after login is enabled."
          backHref="/dashboard"
          backLabel="Back to Dashboard"
        />
      </main>
      <Footer />
    </>
  )
}
