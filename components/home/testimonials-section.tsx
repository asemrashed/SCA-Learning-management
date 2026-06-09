"use client"

import { ReviewCard } from "@/components/review-card"
import { motion } from "framer-motion"

const reviews = [
  {
    name: "Faisal Azam Siddiqui",
    review:
      "The MERN course was incredibly helpful for skill development. They tried to solve every problem of mine during live classes. The support instructors were excellent too. For all these reasons, my MERN learning journey was outstanding.",
    course: "Full Stack Web Development with MERN",
    batch: "Batch 1",
    initials: "FA",
  },
  {
    name: "Shafayet Rana",
    review:
      "What makes this platform special is that they focus more on design psychology than design alone. That really helps students stand out in the job market. This industry-focused approach helped me professionally in many ways.",
    course: "UX/UI Design",
    batch: "Batch 6",
    initials: "SR",
  },
  {
    name: "Abu Hasan",
    review:
      "I got the classes exactly as I wanted. I learned a lot from the sessions. The instructor was excellent. I enjoyed the experience overall and I'm fully satisfied.",
    course: "UX/UI Design",
    batch: "Batch 17",
    initials: "AH",
  },
  {
    name: "Jahid Hossain",
    review:
      "This is one of the best courses I've ever taken! Whether it's the learning experience or the team's support, everything was outstanding. Concepts were taught in such detail from the very basics that I had the chance to learn so much.",
    course: "Full Stack Web Development with MERN",
    batch: "Batch 2",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "MD Galib Hasan",
    review:
      "Even though I come from a non-CS background, I felt that understanding data science would help me advance in my profession. I enrolled in the Data Science course thinking it would be tough without prior knowledge, but they made it simple and easy to follow.",
    course: "Data Science Certificate Program",
    batch: "Batch 09",
    initials: "MG",
  },
  {
    name: "Md Ashfaque Ul Hoque",
    review:
      "A well-structured, complete course packed with clear guidelines. In my opinion, you won't need any extra help beyond what's covered in the modules.",
    course: "UX/UI Design",
    batch: "Batch 6",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Nayem Islam",
    review:
      "My expectations for the MERN course were 100% fulfilled. I received instant support whenever I needed it. That's why I had the confidence to learn by making mistakes. I'll always recommend these courses.",
    course: "Full Stack Web Development with MERN",
    batch: "Batch 2",
    initials: "NI",
  },
  {
    name: "ARM Salahuddin",
    review:
      "The Data Science program was perfect for me. I would recommend it to anyone interested in taking the course.",
    course: "Data Science Certificate Program",
    batch: "Batch 10",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            What Our Students Say
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Hear from our graduates who have successfully transformed their careers
          </p>
        </motion.div>

        {/* Desktop Layout (4 columns on lg screens) */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-6">
          {/* Column 1 */}
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.0 }}
              viewport={{ once: true }}
            >
              <ReviewCard {...reviews[0]} /> {/* Faisal */}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <ReviewCard {...reviews[3]} /> {/* Jahid */}
            </motion.div>
          </div>

          {/* Column 2 & 3 */}
          <div className="col-span-2 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <ReviewCard {...reviews[1]} /> {/* Shafayet */}
            </motion.div>
            <div className="grid grid-cols-2 gap-6">
              {/* Column 2 inner */}
              <div className="flex flex-col gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <ReviewCard {...reviews[4]} /> {/* Galib */}
                </motion.div>
              </div>
              {/* Column 3 inner */}
              <div className="flex flex-col gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <ReviewCard {...reviews[5]} /> {/* Ashfaque */}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <ReviewCard {...reviews[7]} /> {/* Salahuddin */}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <ReviewCard {...reviews[2]} /> {/* Abu Hasan */}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <ReviewCard {...reviews[6]} /> {/* Nayem Islam */}
            </motion.div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:hidden">
          {reviews.map((review, index) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (index % 2) * 0.1 }}
              viewport={{ once: true }}
            >
              <ReviewCard {...review} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
