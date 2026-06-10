"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Play, BookOpen, Pencil, GraduationCap, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const floatingIcons = [
  { Icon: BookOpen, className: "left-[8%] top-[22%] h-10 w-10 md:h-12 md:w-12" },
  { Icon: Pencil, className: "right-[12%] top-[18%] h-9 w-9 md:h-11 md:w-11" },
  { Icon: GraduationCap, className: "left-[15%] bottom-[32%] h-8 w-8 md:h-10 md:w-10" },
  { Icon: Rocket, className: "right-[18%] bottom-[36%] h-9 w-9 md:h-11 md:w-11" },
]

const HERO_PERSON_IMAGE =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop"

export function HeroSection() {
  return (
    <section className="relative -mt-[4.75rem] text-white md:-mt-[5.25rem] h-[95dvh] lg:h-[90dvh]">
      {/* Background image — object-top keeps torn bottom edge in view */}
      <div className="absolute inset-0 -bottom-8 md:-bottom-22 -top-20">
        <Image
          src="/HeroImage.png"
          alt=""
          fill
          className="object-cover object-top scale-y-110 md:scale-y-90"
          priority
          aria-hidden
        />
      </div>

      {/* Non-filled decorative icons */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {floatingIcons.map(({ Icon, className }, i) => (
          <Icon
            key={i}
            className={`absolute stroke-[1.5] text-white/25 ${className}`}
            fill="none"
          />
        ))}
      </div>

      {/* Content — extra bottom padding reveals the torn paper shape */}
      <div className="container relative z-10 mx-auto px-4 pb-20 pt-28 mt-20 md:mt-0 h-full flex items-center justify-center lg:pb-26 lg:pt-40">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
              Master New Skills,
              <br />
              Advance with Confidence
            </h1>

            <p className="mx-auto mb-8 max-w-lg text-pretty text-base text-white/80 md:text-lg lg:mx-0">
              Transform your career with premium live courses, hands-on projects,
              and expert guidance from industry professionals.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                className="rounded-full bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <Link href="/courses">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 bg-transparent px-8 text-base text-white hover:bg-white/10"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Video
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="relative">
              <div className="relative flex h-72 w-72 items-center justify-center rounded-full bg-primary/30 md:h-80 md:w-80 lg:h-96 lg:w-96">
                <div className="relative h-[88%] w-[88%] overflow-hidden rounded-full border-4 border-primary/50">
                  <Image
                    src={HERO_PERSON_IMAGE}
                    alt="Professional learner with laptop"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-2xl bg-white/95 px-5 py-3 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face",
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
                      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
                    ].map((src, i) => (
                      <div
                        key={i}
                        className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white"
                      >
                        <Image src={src} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">32k+ Learners</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
