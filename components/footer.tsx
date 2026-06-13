"use client"

import Link from "next/link"
import {
  Mail,
  MapPin,
  Phone,
  Facebook,
  Instagram,
  Twitter,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BRAND_EMAIL, BRAND_NAME, BRAND_PHONE } from "@/lib/brand"

const usefulLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/courses?category=web", label: "Web Development" },
  { href: "/courses?category=creative", label: "Design" },
]

const supportLinks = [
  { href: "/help", label: "Documentation" },
  { href: "/courses", label: "Available Courses" },
  { href: "/community", label: "Forum" },
  { href: "/instructors", label: "Instructors" },
]

export function Footer() {
  return (
    <footer className="relative">
      {/* Admission floating card */}
      <div className="container relative z-30 mx-auto px-4">
        <div className="relative -mb-20 overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground shadow-xl md:px-12 md:py-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 Q15 15 30 30 T60 30' fill='none' stroke='%23012824' stroke-width='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="mb-3 text-2xl font-bold md:text-3xl">
                Admission is open for the next year batch.
              </h2>
              <p className="text-primary-foreground/80">
                Enrollment is now open for the upcoming year&apos;s batch. Join us to
                secure your spot and start your journey toward growth and success.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[220px]">
              <Button
                size="lg"
                className="w-full rounded-full bg-secondary px-8 text-base font-bold text-secondary-foreground hover:bg-secondary/90"
                asChild
              >
                <Link href="/courses">Get started now</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full border-primary-foreground/30 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Phone className="mr-2 h-4 w-4" />
                {BRAND_PHONE}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-secondary pt-28 pb-0 text-secondary-foreground">
        <div className="container mx-auto px-4 pb-12 pt-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-5">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">{BRAND_NAME}</span>
              </Link>
              <p className="text-sm leading-relaxed text-secondary-foreground/70">
                Premium online skill development platform. Master in-demand skills
                with live courses, expert instructors, and career support.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Instagram, label: "Instagram" },
                  { icon: Twitter, label: "Twitter" },
                ].map(({ icon: Icon, label }) => (
                  <Link
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/80"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Useful Links */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <h3 className="mb-5 text-base font-semibold">Useful Links</h3>
              <ul className="space-y-3">
                {usefulLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-secondary-foreground/70 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <h3 className="mb-5 text-base font-semibold">Support</h3>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-secondary-foreground/70 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <h3 className="mb-5 text-base font-semibold">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left gap-2 lg:gap-3 text-sm text-secondary-foreground/70">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Ka-6/a, Navana Sylvania, Baridhara Road,
                    <br />
                    Nadda, Gulshan-2, Dhaka-1212
                  </span>
                </li>
                <li className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left gap-2 lg:gap-3 text-sm text-secondary-foreground/70">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <span>{BRAND_EMAIL}</span>
                </li>
                <li className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left gap-2 lg:gap-3 text-sm text-secondary-foreground/70">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <span>{BRAND_PHONE}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-secondary-foreground/10 bg-black/20 py-5">
          <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 text-sm text-secondary-foreground/60 sm:flex-row">
            <p>Copyright {new Date().getFullYear()} All Rights Reserved</p>
            <div className="flex gap-6">
              <Link href="/terms" className="transition-colors hover:text-primary">
                Terms & Conditions
              </Link>
              <Link href="/privacy-policy" className="transition-colors hover:text-primary">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
