"use client"

import { Users, Award, BookOpen, Briefcase } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { motion } from "framer-motion"

const stats = [
  { value: "9,000+", label: "Job Placements", color: "teal" as const },
  { value: "150K+", label: "Active Learners", color: "blue" as const },
  { value: "83%", label: "Completion Rate", color: "coral" as const },
  { value: "28", label: "Live Courses", color: "amber" as const },
]

export function StatsSection() {
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
            Our Impact in Numbers
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Join thousands of learners who have transformed their careers with our platform
          </p>
        </motion.div>

        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
