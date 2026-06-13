import { ComingSoonPage } from "@/components/coming-soon-page"

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <ComingSoonPage
        title="Contact"
        description="Reach out to our team for support or inquiries. This page is coming soon."
        backHref="/"
        backLabel="Back to Home"
      />
    </main>
  )
}
