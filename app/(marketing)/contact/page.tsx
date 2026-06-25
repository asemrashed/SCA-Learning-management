import Link from "next/link"
import { Mail, Phone } from "lucide-react"
import { ContactForm } from "./contact-form"
import { BRAND_EMAIL, BRAND_PHONE } from "@/lib/brand"

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
    <div className="bg-background min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-secondary py-16 md:py-24 text-secondary-foreground">
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
            <span className="text-secondary-foreground">Contact</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Get in Touch
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary-foreground/80">
            Have questions about our commerce courses, batches, or study packages? Reach out to us
            anytime.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Info Cards Column */}
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

            {/* Form Column */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
