import { ComingSoonPage } from "@/components/coming-soon-page"

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <ComingSoonPage
        title="Privacy Policy"
        description="Our privacy policy will be published here soon."
        backHref="/"
        backLabel="Back to Home"
      />
    </main>
  )
}
