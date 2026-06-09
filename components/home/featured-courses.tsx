"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ArrowRight, Code, Briefcase, TrendingUp, Database, Palette, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/course-card"
import { CategoryNav } from "@/components/home/category-nav"
import { motion } from "framer-motion"

const categories = [
  { id: "web", label: "Web & App Development", icon: Code, subtitle: "14 Courses • 2 Workshops" },
  { id: "product", label: "Product Management & Design", icon: Briefcase, subtitle: "10 Courses • 1 Workshop" },
  { id: "business", label: "Business & Marketing", icon: TrendingUp, subtitle: "12 Courses • 2 Workshops" },
  { id: "data", label: "Data Engineering", icon: Database, subtitle: "8 Courses • 1 Workshop" },
  { id: "creative", label: "Creatives", icon: Palette, subtitle: "15 Courses • 3 Workshops" },
]

const courses = [
  {
    id: "1",
    title: "Full Stack Web Development with Python, Django & React",
    image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=250&fit=crop",
    batch: "Batch 7",
    seatsLeft: 36,
    daysLeft: 20,
    category: "Web & App Development",
    categoryId: "web",
    isLive: true,
  },
  {
    id: "2",
    title: "App Development with Flutter & AI Integration",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
    batch: "Batch 13",
    seatsLeft: 5,
    daysLeft: 6,
    category: "Web & App Development",
    categoryId: "web",
    isLive: true,
  },
  {
    id: "3",
    title: "Full Stack Web Development with ASP.Net Core",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
    batch: "Batch 8",
    seatsLeft: 39,
    daysLeft: 10,
    category: "Web & App Development",
    categoryId: "web",
    isLive: true,
  },
  {
    id: "4",
    title: "Full Stack Web Development with PHP, Laravel & Vue.js",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop",
    batch: "Batch 10",
    seatsLeft: 36,
    daysLeft: 11,
    category: "Web & App Development",
    categoryId: "web",
    isLive: true,
  },
  {
    id: "5",
    title: "Data Analytics & Business Intelligence Masterclass",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
    batch: "Batch 5",
    seatsLeft: 22,
    daysLeft: 15,
    category: "Data Engineering",
    categoryId: "data",
    isLive: true,
  },
  {
    id: "6",
    title: "Product Management: From Zero to Product Leader",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    batch: "Batch 4",
    seatsLeft: 18,
    daysLeft: 8,
    category: "Product Management",
    categoryId: "product",
    isLive: true,
  },
  {
    id: "7",
    title: "Digital Marketing & Growth Hacking Bootcamp",
    image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=250&fit=crop",
    batch: "Batch 6",
    seatsLeft: 28,
    daysLeft: 12,
    category: "Business & Marketing",
    categoryId: "business",
    isLive: true,
  },
  {
    id: "8",
    title: "UI/UX Design Career Track Program",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=250&fit=crop",
    batch: "Batch 9",
    seatsLeft: 15,
    daysLeft: 5,
    category: "Creatives",
    categoryId: "creative",
    isLive: true,
  },
]

export function FeaturedCourses() {
  const [activeCategory, setActiveCategory] = useState("web")

  const filteredCourses = useMemo(
    () => courses.filter((c) => c.categoryId === activeCategory),
    [activeCategory]
  )

  const displayCourses = filteredCourses.length > 0 ? filteredCourses : courses.slice(0, 4)

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <Radio className="h-5 w-5 text-destructive" />
            <span className="text-lg font-bold text-foreground md:text-xl">
              Explore Our Live Courses
            </span>
          </div>
        </motion.div>

        <CategoryNav
          items={categories}
          activeId={activeCategory}
          onChange={setActiveCategory}
          className="mb-10"
        />

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {displayCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <CourseCard {...course} />
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
          <Button variant="outline" size="lg" className="rounded-xl" asChild>
            <Link href="/courses">
              View All Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
