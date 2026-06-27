import Link from "next/link"
import { MarketingPageHero } from "@/components/marketing-page-hero"

export const metadata = {
  title: "Terms & Conditions | Sharif Commerce Academy",
  description:
    "Read the Terms & Conditions for enrolling in courses and using the services provided by Sharif Commerce Academy (SCA).",
}

const sections = [
  {
    title: "Intellectual Property",
    body: "All educational content, course curriculum, videos, study notes, live streams, codes, templates, graphics, and logos displayed on Sharif Commerce Academy are the exclusive intellectual property of Sharif Commerce Academy. You are granted a personal, non-transferable, and non-exclusive license to view and download study files for personal educational use only. Sharing, duplicating, or commercializing this content is strictly prohibited.",
  },
  {
    title: "User Accounts and Security",
    body: "To register for live courses, you must create a user account. You agree to provide accurate and complete registration information. You are solely responsible for maintaining the confidentiality of your account credentials (username and password) and for any activity under your account. Sharing accounts with multiple users is a violation of our policy and may result in immediate suspension of account privileges without refund.",
  },
  {
    title: "Course Enrollment and Payments",
    body: "Enrollment in live batches or course packages is confirmed upon successful processing of tuition fees through our integrated payment gateways. Prices and course inclusions are subject to change. Sharif Commerce Academy reserves the right to cancel or postpone live batches due to unexpected schedule conflicts, in which case students will be offered alternative slots or refunds.",
  },
  {
    title: "Refund Policy",
    body: "Unless specified otherwise on the specific course checkout page, all course admissions, digital study packets, and membership fees are non-refundable once class sessions commence or digital materials are downloaded. If you encounter technical issues that prevent access, please reach out to our support channel immediately.",
  },
  {
    title: "Code of Conduct",
    body: "We expect all students, teachers, and coordinators to interact with mutual respect inside chat groups, forums, and live sessions. We maintain zero tolerance for harassment, hate speech, spam, academic cheating, or sharing harmful links. Violating the code of conduct will lead to immediate account termination.",
  },
  {
    title: "Limitation of Liability",
    body: 'Sharif Commerce Academy is not responsible for any technical issues, system downtimes, or loss of progress caused by server malfunctions, internet disruptions, or third-party provider failures. We provide all services on an "as is" and "as available" basis.',
  },
  {
    title: "Governing Law",
    body: "These Terms & Conditions are governed by the laws of Bangladesh. Any disputes arising from or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.",
  },
]

export default function TermsPage() {
  const lastUpdated = "June 18, 2026"

  return (
    <div className="min-h-screen bg-background">
      <MarketingPageHero breadcrumb="Terms & Conditions" title="Terms & Conditions">
        <p className="mx-auto mt-2 text-sm text-secondary-foreground/60">
          Last Updated: {lastUpdated}
        </p>
      </MarketingPageHero>

      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="space-y-8 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-12">
            <p className="leading-relaxed text-muted-foreground">
              Welcome to Sharif Commerce Academy (SCA). These Terms and Conditions govern your access
              to and use of our website, courses, and other educational services. By enrolling in our
              courses or accessing our platform, you agree to be bound by these terms.
            </p>

            <hr className="border-border" />

            <div className="space-y-6">
              {sections.map((section, index) => (
                <section key={section.title} className="space-y-3">
                  <h2 className="flex items-center gap-3 text-xl font-bold text-foreground">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-sm font-bold text-secondary dark:text-primary">
                      {index + 1}
                    </span>
                    {section.title}
                  </h2>
                  <p className="pl-10 text-sm leading-relaxed text-muted-foreground">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>

            <hr className="border-border" />

            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-muted/50 p-6 text-center sm:flex-row sm:text-left">
              <div>
                <h4 className="font-bold text-foreground">Have questions about our terms?</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Our compliance team is ready to answer your questions.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-secondary px-6 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90"
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
