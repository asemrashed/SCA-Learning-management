import { ComingSoonPage } from "@/components/coming-soon-page"

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <ComingSoonPage
        title="About Us"
        description="Learn more about our mission, team, and story. This page is coming soon."
        backHref="/"
        backLabel="Back to Home"
      />
    </main>
  )
}
