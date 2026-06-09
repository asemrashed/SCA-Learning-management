"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function CTABanner() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[32px] bg-secondary p-8 text-secondary-foreground md:p-16"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Practice Interviews with AI Coach
            </h2>
            <p className="mb-8 max-w-2xl text-secondary-foreground/80">
              Get personalized feedback on your interview performance with our AI-powered 
              interview coach. Join the waitlist for early access.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <Link href="/ai-coach">
                  Join Waitlist
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10"
              >
                Learn More
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
