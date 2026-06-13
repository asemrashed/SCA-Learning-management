"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, GraduationCap, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/course-card"
import { CategoryNav } from "@/components/home/category-nav"
import { useListCoursesQuery } from "@/features/course/api"
import { motion } from "framer-motion"

const MAX_CARDS = 4

export function FeaturedCourses() {
  const { data, isLoading } = useListCoursesQuery({
    page: 1,
    pageSize: 8,
    sort: "createdAt:desc",
  })

  const courses = data?.data ?? []

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const course of courses) {
      if (!course.category) continue
      counts.set(course.category, (counts.get(course.category) ?? 0) + 1)
    }

    const categoryItems = Array.from(counts.entries()).map(([label, count]) => ({
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
      icon: BookOpen,
      subtitle: `${count} Course${count === 1 ? "" : "s"}`,
    }))

    return [
      {
        id: "all",
        label: "All",
        icon: Grid3X3,
        subtitle: `${courses.length} Course${courses.length === 1 ? "" : "s"}`,
      },
      ...categoryItems,
    ]
  }, [courses])

  const [activeCategory, setActiveCategory] = useState("all")

  const filteredCourses = useMemo(() => {
    if (activeCategory === "all") return courses
    const label = categories.find((c) => c.id === activeCategory)?.label
    return courses.filter((c) => c.category === label)
  }, [courses, activeCategory, categories])

  const displayCourses = filteredCourses.slice(0, MAX_CARDS)

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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h2 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            Explore Our Courses
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Browse curated courses across categories and start learning at your own pace
          </p>
        </motion.div>

        {categories.length > 0 ? (
          <CategoryNav
            items={categories}
            activeId={activeCategory}
            onChange={setActiveCategory}
            className="mb-10"
          />
        ) : null}

        {isLoading ? (
          <p className="py-12 text-center text-muted-foreground">Loading courses…</p>
        ) : displayCourses.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">Courses coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {displayCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <CourseCard
                  id={course.slug || course.id}
                  title={course.title}
                  image={
                    course.thumbnail ??
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"
                  }
                  category={course.category ?? undefined}
                  price={course.priceMinor === 0 ? 0 : course.priceMinor / 100}
                  isFree={course.priceMinor === 0}
                />
              </motion.div>
            ))}
          </div>
        )}

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
