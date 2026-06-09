"use client"

import Image from "next/image"
import Link from "next/link"
import { Check, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const features = [
  "Training Services",
  "Big Experience",
  "Expert Trainer",
  "Lifetime access",
]

const ABOUT_PERSON_IMAGE =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&h=600&fit=crop"

export function AboutSection() {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <div className="relative flex justify-center">
              <div className="absolute -left-2 top-6 h-52 w-52 rounded-full bg-primary/25 md:-left-4 md:h-64 md:w-64" />
              <div className="absolute -right-1 bottom-8 h-36 w-36 rounded-full bg-brand-category md:h-44 md:w-44" />
              <div className="relative flex h-80 w-80 items-center justify-center rounded-full bg-primary/20 md:h-96 md:w-96">
                <div className="relative h-[85%] w-[85%] overflow-hidden rounded-full">
                  <Image
                    src={ABOUT_PERSON_IMAGE}
                    alt="Student with books and backpack"
                    fill
                    className="object-cover object-center"
                  />
                </div>
              </div>

              {/* Floating experience card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="absolute bottom-4 left-0 rounded-2xl border border-border bg-card px-5 py-4 shadow-lg md:left-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/30">
                    <GraduationCap className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">25</p>
                    <p className="text-sm text-muted-foreground">Years of experience</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Content side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm font-semibold uppercase tracking-wider text-secondary">
                About Us
              </span>
            </div>
            <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl lg:text-[2.75rem] lg:leading-tight">
              The Strategy for Exponential Learning Growth
            </h2>
            <p className="mb-8 leading-relaxed text-muted-foreground">
              We provide premium live courses designed to help you master in-demand skills.
              Our expert-led programs combine hands-on projects, career support, and a vibrant
              learning community to accelerate your professional growth.
            </p>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature}</span>
                </div>
              ))}
            </div>
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="/courses">Explore More</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
