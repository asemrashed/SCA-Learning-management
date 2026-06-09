"use client"

import { InstructorCard } from "@/components/instructor-card"
import { motion } from "framer-motion"

const instructors = [
  {
    name: "Ahmed Rahman",
    title: "Senior Full Stack Developer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    rating: 4.9,
    students: 12540,
    courses: 7,
  },
  {
    name: "Sarah Chen",
    title: "Data Science Lead at Google",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    rating: 4.8,
    students: 8750,
    courses: 5,
  },
  {
    name: "Michael Foster",
    title: "Product Manager at Meta",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    rating: 4.9,
    students: 6320,
    courses: 4,
  },
  {
    name: "Emily Johnson",
    title: "UX Design Director",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    rating: 4.7,
    students: 9180,
    courses: 6,
  },
]

export function InstructorsSection() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Learn from Industry Experts
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Our instructors are experienced professionals from leading companies around the world
          </p>
        </motion.div>

        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {instructors.map((instructor, index) => (
            <motion.div
              key={instructor.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <InstructorCard {...instructor} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
