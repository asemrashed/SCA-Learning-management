"use client"

import Link from "next/link"
import { ArrowRight, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"

const categories = [
  {
    id: "wordpress",
    number: "01",
    title: "WordPress Development",
    description: "This introductory course is for students with little to no English.",
    courses: 4,
    href: "/courses?category=wordpress",
    colSpan: "lg:col-span-7",
  },
  {
    id: "web",
    number: "02",
    title: "Web Development",
    description: "This introductory course is for students with little to no English.",
    image: "/web-development.png",
    courses: 4,
    href: "/courses?category=web",
    colSpan: "lg:col-span-10",
  },
  {
    id: "app",
    number: "03",
    title: "App Development",
    description: "This introductory course is for with little to no English.",
    courses: 4,
    href: "/courses?category=app",
    colSpan: "lg:col-span-7",
  },
  {
    id: "javascript",
    number: "04",
    title: "Java Script",
    description: "This introductory course is for students with little to no English.",
    image: "/javascript.png",
    courses: 4,
    href: "/courses?category=javascript",
    colSpan: "lg:col-span-10",
  },
  {
    id: "it-software",
    number: "05",
    title: "IT & Software",
    description: "This introductory course is for students with little to no English.",
    courses: 4,
    href: "/courses?category=it-software",
    colSpan: "lg:col-span-7",
  },
  {
    id: "graphics-designer",
    number: "06",
    title: "Graphics Designer",
    description: "This introductory course is for students with little to no English.",
    courses: 4,
    href: "/courses?category=graphics-designer",
    colSpan: "lg:col-span-7",
  },
]

export function LearningCategories() {
  return (
    <section className="bg-brand-category py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <LayoutGrid className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-bold text-foreground md:text-xl">
              Choice Favourite Course
            </h2>
          </div>
        </motion.div>

        <div className="grid gap-3 md:gap-6 grid-cols-2 lg:grid-cols-[repeat(24,minmax(0,1fr))]">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className={`w-full ${category.colSpan}`}
            >
              <Link
                href={category.href}
                className="group relative block h-full overflow-hidden rounded-2xl bg-white p-4 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]"
              >
                <span className="pointer-events-none absolute -bottom-2 -right-1 text-[5rem] font-bold leading-none text-secondary/10 select-none">
                  {category.number}
                </span>

                <div className="relative z-10 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-center h-full text-center sm:text-left">
                  {category.image && (
                    <div className="flex h-14 w-14 sm:h-20 sm:w-20 md:h-24 md:w-24 shrink-0 items-center justify-center rounded-full bg-primary/20 p-1.5 sm:p-2">
                      <Image
                        src={category.image}
                        alt={category.title}
                        width={80}
                        height={80}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 sm:mb-2 text-sm sm:text-base md:text-lg font-semibold text-foreground transition-colors group-hover:text-secondary">
                      {category.title}
                    </h3>
                    <p className="mb-2 sm:mb-4 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                    <span className="inline-flex items-center rounded-full bg-primary/40 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium text-secondary">
                      • {category.courses}+ Courses
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button
            size="lg"
            className="rounded-full bg-secondary px-8 text-secondary-foreground hover:bg-secondary/90"
            asChild
          >
            <Link href="/courses">
              See All Category
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
