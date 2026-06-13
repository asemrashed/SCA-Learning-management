import { ComingSoonPage } from "@/components/coming-soon-page"

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <ComingSoonPage
        title="Terms & Conditions"
        description="Our terms and conditions will be published here soon."
        backHref="/"
        backLabel="Back to Home"
      />
    </main>
  )
}
