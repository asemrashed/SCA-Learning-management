import Link from "next/link"
import { Mail, Phone } from "lucide-react"
import { ContactForm } from "./contact-form"
import { BRAND_EMAIL, BRAND_PHONE } from "@/lib/brand"
import { MarketingPageHero } from "@/components/marketing-page-hero"

export const metadata = {
  title: "Contact Us | Sharif Commerce Academy",
  description:
    "Get in touch with Sharif Commerce Academy (SCA). Reach out for course enrollment, questions, or support.",
}

const contactDetails = [
  {
    icon: Phone,
    title: "Phone Number",
    content: BRAND_PHONE,
    description: "Available from 9:00 AM to 9:00 PM",
    href: `tel:${BRAND_PHONE}`,
  },
  {
    icon: Mail,
    title: "Email Address",
    content: BRAND_EMAIL,
    description: "We'll respond within 24 hours",
    href: `mailto:${BRAND_EMAIL}`,
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingPageHero
        breadcrumb="Contact"
        title="Get in Touch"
        description="Have questions about our commerce courses, batches, or study packages? Reach out to us anytime."
      />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-secondary dark:text-primary">
                    Contact Info
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-bold text-foreground">Contact Information</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Connect with Sharif Commerce Academy through phone or email — we&apos;re here to
                  help with courses, enrollment, and support.
                </p>
              </div>

              <div className="space-y-4">
                {contactDetails.map((detail) => {
                  const Icon = detail.icon
                  return (
                    <a
                      key={detail.title}
                      href={detail.href}
                      className="group block rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/25 text-secondary transition-colors group-hover:bg-primary group-hover:text-primary-foreground dark:text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-foreground">{detail.title}</h4>
                          <p className="text-sm text-foreground/85">{detail.content}</p>
                          <p className="text-xs text-muted-foreground">{detail.description}</p>
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>

            <div className="lg:col-span-2">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
