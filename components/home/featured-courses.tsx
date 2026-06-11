"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/course-card"
import { CategoryNav } from "@/components/home/category-nav"
import { useListCoursesQuery } from "@/features/course/api"
import { motion } from "framer-motion"

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
    return Array.from(counts.entries()).map(([label, count]) => ({
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
      icon: BookOpen,
      subtitle: `${count} Course${count === 1 ? "" : "s"}`,
    }))
  }, [courses])

  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const activeId = activeCategory ?? categories[0]?.id ?? "all"

  const filteredCourses = useMemo(() => {
    if (activeId === "all" || categories.length === 0) return courses
    const label = categories.find((c) => c.id === activeId)?.label
    return courses.filter((c) => c.category === label)
  }, [courses, activeId, categories])

  const displayCourses =
    filteredCourses.length > 0 ? filteredCourses.slice(0, 4) : courses.slice(0, 4)

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
              Explore Our Courses
            </span>
          </div>
        </motion.div>

        {categories.length > 0 ? (
          <CategoryNav
            items={categories}
            activeId={activeId}
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
