"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Grid3X3, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/course-card"
import { CategoryNav } from "@/components/home/category-nav"
import { useListCoursesQuery } from "@/features/course/api"
import { useListCategoriesQuery } from "@/features/category/api"
import {
  BROWSE_COURSES,
  COURSE_CATALOG_HREF,
  OUR_RECORDED_COURSES,
  courseCount,
} from "@/lib/product-vocabulary"
import { DeliveryMode } from "@/types/api"
import { motion } from "framer-motion"

const MAX_CARDS = 4

export function RecordedCoursesSection() {
  const { data, isLoading } = useListCoursesQuery({
    page: 1,
    pageSize: 12,
    sort: "createdAt:desc",
    deliveryMode: DeliveryMode.RECORDED,
  })

  const { data: categoriesData } = useListCategoriesQuery({
    pageSize: 100,
    sort: "order:asc",
  })

  const courses = useMemo(
    () => (data?.data ?? []).filter((course) => course.isPublished),
    [data?.data],
  )

  const categories = useMemo(() => {
    const apiCategories = categoriesData?.data ?? []
    const categoryItems = apiCategories
      .filter((cat) => courses.some((c) => c.categorySlug === cat.slug || c.category === cat.title))
      .map((cat) => {
        const count = courses.filter(
          (c) => c.categorySlug === cat.slug || c.category === cat.title,
        ).length
        return {
          id: cat.slug,
          label: cat.title,
          icon: BookOpen,
          subtitle: courseCount(count),
        }
      })

    return [
      {
        id: "all",
        label: "All",
        icon: Grid3X3,
        subtitle: courseCount(courses.length),
      },
      ...categoryItems,
    ]
  }, [categoriesData, courses])

  const [activeCategory, setActiveCategory] = useState("all")

  const filteredCourses = useMemo(() => {
    if (activeCategory === "all") return courses
    const cat = categoriesData?.data?.find((c) => c.slug === activeCategory)
    if (!cat) return courses
    return courses.filter((c) => c.categorySlug === cat.slug || c.category === cat.title)
  }, [courses, activeCategory, categoriesData])

  const displayCourses = filteredCourses.slice(0, MAX_CARDS)

  if (isLoading || courses.length === 0) {
    return null
  }

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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
              <PlayCircle className="h-5 w-5 text-secondary" />
            </div>
          </div>
          <h2 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            {OUR_RECORDED_COURSES}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Learn at your own pace with on-demand video lessons and structured chapters
          </p>
        </motion.div>

        {categories.length > 1 ? (
          <CategoryNav
            items={categories}
            activeId={activeCategory}
            onChange={setActiveCategory}
            variant="dark"
            className="mb-10"
          />
        ) : null}

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
                variant="dark"
                textWhite
                id={course.slug || course.id}
                title={course.title}
                image={
                  course.thumbnail ??
                  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"
                }
                category={course.category ?? undefined}
                price={course.priceMinor === 0 ? 0 : course.priceMinor / 100}
                isFree={course.priceMinor === 0}
                students={course.studentCount ?? 0}
              />
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
            variant="outline"
            size="lg"
            className="rounded-xl border-secondary/30 hover:bg-secondary hover:text-secondary-foreground"
            asChild
          >
            <Link href={COURSE_CATALOG_HREF}>
              {BROWSE_COURSES}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
