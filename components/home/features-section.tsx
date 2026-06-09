"use client"

import { Briefcase, FileText, Headphones, Award, Monitor, Palette } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Briefcase,
    title: "Dedicated Job Placement Team",
    description: "Get matched with top employers through our dedicated career support team",
  },
  {
    icon: FileText,
    title: "CV Builder & Expert Review",
    description: "Create professional CVs with our builder and get feedback from experts",
  },
  {
    icon: Headphones,
    title: "18-Hour Live Support",
    description: "Get help when you need it with extended live support hours",
  },
  {
    icon: Award,
    title: "Special Pro Batch Support",
    description: "Access exclusive career resources and personalized guidance",
  },
  {
    icon: Monitor,
    title: "Live Assessment Tests",
    description: "Test your skills with real-time assessments and get instant feedback",
  },
  {
    icon: Palette,
    title: "Up to 3 Support Classes Daily",
    description: "Join additional support sessions for in-depth topic coverage",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            What You Get with Live Courses
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Our comprehensive learning experience goes beyond just video lectures
          </p>
        </motion.div>

        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-[20px] bg-card p-6 shadow-sm transition-all hover:shadow-lg"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
