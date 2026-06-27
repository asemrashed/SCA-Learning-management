import Link from "next/link"
import { MarketingPageHero } from "@/components/marketing-page-hero"

export const metadata = {
  title: "Privacy Policy | Sharif Commerce Academy",
  description: "Read the Privacy Policy to understand how Sharif Commerce Academy (SCA) collects, uses, and protects your personal data.",
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "June 18, 2026"

  return (
    <div className="min-h-screen bg-background">
      <MarketingPageHero breadcrumb="Privacy Policy" title="Privacy Policy">
        <p className="mx-auto mt-2 text-sm text-secondary-foreground/60">
          Last Updated: {lastUpdated}
        </p>
      </MarketingPageHero>

      {/* Privacy Policy Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="rounded-3xl border border-border bg-card p-6 md:p-12 shadow-sm space-y-8">
            <div className="prose prose-slate max-w-none dark:prose-invert">
              <p className="text-muted-foreground leading-relaxed">
                Sharif Commerce Academy ("SCA", "we", "us", or "our") respects your privacy and is committed to protecting the personal data you share with us. This Privacy Policy explains how we collect, use, store, and protect your information when you visit our website, use our platform, or enroll in our courses.
              </p>
            </div>

            <hr className="border-border" />

            <div className="space-y-6">
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-secondary dark:text-primary text-sm font-bold">1</span>
                  Information We Collect
                </h2>
                <div className="text-muted-foreground text-sm leading-relaxed pl-10 space-y-2">
                  <p>We collect information you provide directly to us when you create an account, enroll in a batch, or communicate with us. This includes:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Account Details:</strong> Full Name, email address, password, phone number.</li>
                    <li><strong>Billing Details:</strong> Address, transaction details, and billing name. (Payment processing is handled securely by our external providers like SSLCommerz; we do not store your credit card or bank login information).</li>
                    <li><strong>Study Progress:</strong> Quiz scores, assignment uploads, course status, watch progress, and active participation in class forums.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-secondary dark:text-primary text-sm font-bold">2</span>
                  How We Use Your Information
                </h2>
                <div className="text-muted-foreground text-sm leading-relaxed pl-10 space-y-2">
                  <p>We use the collected information for various educational and operational purposes, including:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Providing access to student dashboards, active live class feeds, and curriculum files.</li>
                    <li>Processing course enrollment fees and keeping track of transaction receipts.</li>
                    <li>Sending critical announcements, schedule updates, or course changes.</li>
                    <li>Improving the interactive learning tools, video players, and user interface layouts.</li>
                    <li>Responding to customer support queries, resolving bugs, and enforcing community rules.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-secondary dark:text-primary text-sm font-bold">3</span>
                  Information Sharing and Disclosures
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed pl-10">
                  Sharif Commerce Academy does not sell, lease, or distribute your personal contact information to any advertising brokers or external marketing companies. We share information only with trusted third-party service providers who assist us in operating our platform, specifically: payment gateway services (SSLCommerz) for executing secure transactions, and authentication services. These services are contractually bound to safeguard your data.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-secondary dark:text-primary text-sm font-bold">4</span>
                  Data Protection and Security
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed pl-10">
                  We employ industry-standard technical security measures (including HTTPS encryption, firewalls, and database access controls) to protect your account and data against unauthorized access, loss, alteration, or disclosure. However, no database transmission over the internet can be guaranteed to be 100% secure. You are responsible for keeping your login credentials confidential.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-secondary dark:text-primary text-sm font-bold">5</span>
                  Cookies and Analytics
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed pl-10">
                  We use cookies and basic tracking tokens to keep you logged in across browser sessions, remember your theme selection (dark/light mode), and collect generic server analytics to check browser performance and fix latency issues. You can disable cookies inside your browser settings, though doing so may log you out of your student portal.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-secondary dark:text-primary text-sm font-bold">6</span>
                  Your Rights & Choices
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed pl-10">
                  You have the right to request access to the personal data we hold about you, request updates to outdated details, or ask us to deactivate your account. If you want to request data deletion, please contact us at support@sharifcommerceacademy.com. Note that certain financial records of transactions must be preserved for accounting and tax purposes.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-secondary dark:text-primary text-sm font-bold">7</span>
                  Changes to this Privacy Policy
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed pl-10">
                  Sharif Commerce Academy reserves the right to modify this Privacy Policy at any time. When updates are published, we will revise the last updated date at the top. If there are major changes to the way we manage data, we will post an notice on our homepage or send direct email notifications.
                </p>
              </section>
            </div>

            <hr className="border-border" />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/50 rounded-2xl p-6 text-center sm:text-left">
              <div>
                <h4 className="font-bold text-foreground">Have privacy concerns?</h4>
                <p className="text-sm text-muted-foreground mt-1">Contact our Data protection officer for queries.</p>
              </div>
              <Link
                href="/contact"
                className="inline-flex h-10 items-center justify-center rounded-full bg-secondary px-6 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90 transition-colors shrink-0"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
