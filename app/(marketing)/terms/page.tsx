import Link from "next/link"

export const metadata = {
  title: "Terms & Conditions | Sharif Commerce Academy",
  description: "Read the Terms & Conditions for enrolling in courses and using the services provided by Sharif Commerce Academy (SCA).",
}

export default function TermsPage() {
  const lastUpdated = "June 18, 2026"

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-secondary py-16 text-secondary-foreground">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 Q15 15 30 30 T60 30' fill='none' stroke='%2371d4cb' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <nav className="mb-4 flex justify-center space-x-2 text-sm text-secondary-foreground/60">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-secondary-foreground">Terms & Conditions</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Terms & Conditions
          </h1>
          <p className="mx-auto mt-2 text-sm text-secondary-foreground/60">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="rounded-3xl border border-border bg-card p-6 md:p-12 shadow-sm space-y-8">
            <div className="prose prose-slate max-w-none dark:prose-invert">
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Sharif Commerce Academy (SCA). These Terms and Conditions govern your access to and use of our website, courses, and other educational services. By enrolling in our courses or accessing our platform, you agree to be bound by these terms.
              </p>
            </div>

            <hr className="border-border" />

            <div className="space-y-6">
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-secondary dark:text-primary text-sm font-bold">1</span>
                  Intellectual Property
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed pl-10">
                  All educational content, course curriculum, videos, study notes, live streams, codes, templates, graphics, and logos displayed on Sharif Commerce Academy are the exclusive intellectual property of Sharif Commerce Academy. You are granted a personal, non-transferable, and non-exclusive license to view and download study files for personal educational use only. Sharing, duplicating, or commercializing this content is strictly prohibited.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-secondary dark:text-primary text-sm font-bold">2</span>
                  User Accounts and Security
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed pl-10">
                  To register for live courses, you must create a user account. You agree to provide accurate and complete registration information. You are solely responsible for maintaining the confidentiality of your account credentials (username and password) and for any activity under your account. sharing accounts with multiple users is a violation of our policy and may result in immediate suspension of account privileges without refund.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-secondary dark:text-primary text-sm font-bold">3</span>
                  Course Enrollment and Payments
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed pl-10">
                  Enrollment in live batches or course packages is confirmed upon successful processing of tuition fees through our integrated payment gateways. Prices and course inclusions are subject to change. Sharif Commerce Academy reserves the right to cancel or postpone live batches due to unexpected schedule conflicts, in which case students will be offered alternative slots or refunds.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-secondary dark:text-primary text-sm font-bold">4</span>
                  Refund Policy
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed pl-10">
                  Unless specified otherwise on the specific course checkout page, all course admissions, digital study packets, and membership fees are non-refundable once class sessions commence or digital materials are downloaded. If you encounter technical issues that prevent access, please reach out to our support channel immediately.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-secondary dark:text-primary text-sm font-bold">5</span>
                  Code of Conduct
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed pl-10">
                  We expect all students, teachers, and coordinators to interact with mutual respect inside chat groups, forums, and live sessions. We maintain zero tolerance for harassment, hate speech, spam, academic cheating, or sharing harmful links. Violating the code of conduct will lead to immediate account termination.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-secondary dark:text-primary text-sm font-bold">6</span>
                  Limitation of Liability
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed pl-10">
                  Sharif Commerce Academy is not responsible for any technical issues, system downtimes, or loss of progress caused by server malfunctions, internet disruptions, or third-party provider failures. We provide all services on an "as is" and "as available" basis.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-secondary dark:text-primary text-sm font-bold">7</span>
                  Governing Law
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed pl-10">
                  These Terms & Conditions are governed by the laws of Bangladesh. Any disputes arising from or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.
                </p>
              </section>
            </div>

            <hr className="border-border" />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/50 rounded-2xl p-6 text-center sm:text-left">
              <div>
                <h4 className="font-bold text-foreground">Have questions about our terms?</h4>
                <p className="text-sm text-muted-foreground mt-1">Our compliance team is ready to answer your questions.</p>
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
