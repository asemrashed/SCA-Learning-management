"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, BookOpen, GraduationCap, Grid3X3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CourseCard } from "@/components/course-card"
import { CategoryNav } from "@/components/home/category-nav"
import { formatBdtMinor } from "@/lib/format-currency"
import { useListCoursesQuery } from "@/features/course/api"
import type { CourseListItem } from "@/types/api"
import { DeliveryMode } from "@/types/api"
import { motion } from "framer-motion"

interface CourseCatalogProps {
  pageSize?: number
  showHeader?: boolean
}

function toCardProps(course: CourseListItem) {
  return {
    id: course.slug || course.id,
    title: course.title,
    image:
      course.thumbnail ??
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
    category: course.category ?? undefined,
    price: course.priceMinor === 0 ? 0 : course.priceMinor / 100,
    isFree: course.priceMinor === 0,
  }
}

export function CourseCatalog({ pageSize = 12, showHeader = true }: CourseCatalogProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sort, setSort] = useState("createdAt:desc")
  const [activeCategory, setActiveCategory] = useState("all")
  const [visibleCount, setVisibleCount] = useState(pageSize)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [debouncedSearch, sort, activeCategory, pageSize])

  const { data, isLoading, isFetching, error } = useListCoursesQuery({
    page: 1,
    pageSize: 100,
    search: debouncedSearch || undefined,
    sort,
    deliveryMode: DeliveryMode.RECORDED,
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

  const filteredCourses = useMemo(() => {
    if (activeCategory === "all") return courses
    const label = categories.find((c) => c.id === activeCategory)?.label
    return courses.filter((c) => c.category === label)
  }, [courses, activeCategory, categories])

  const visibleCourses = filteredCourses.slice(0, visibleCount)
  const hasMore = visibleCount < filteredCourses.length

  return (
    <div>
      {showHeader ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            Explore Our Courses
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Browse curated courses across categories and start learning at your own pace
          </p>
        </motion.div>
      ) : null}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl pl-9"
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full rounded-xl sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt:desc">Newest First</SelectItem>
            <SelectItem value="title:asc">Title A–Z</SelectItem>
            <SelectItem value="priceMinor:asc">Price: Low to High</SelectItem>
            <SelectItem value="priceMinor:desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {categories.length > 0 ? (
        <CategoryNav
          items={categories}
          activeId={activeCategory}
          onChange={setActiveCategory}
          className="mb-10"
        />
      ) : null}

      {error ? (
        <p className="py-12 text-center text-destructive">Could not load courses.</p>
      ) : isLoading ? (
        <p className="py-12 text-center text-muted-foreground">Loading courses…</p>
      ) : visibleCourses.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No courses found.</p>
      ) : (
        <>
          <p className="mb-6 text-sm text-muted-foreground">
            Showing {visibleCourses.length} of {filteredCourses.length} courses
            {visibleCourses.some((c) => c.priceMinor > 0) ? (
              <span className="sr-only">
                {" "}
                — prices from{" "}
                {formatBdtMinor(Math.min(...visibleCourses.map((c) => c.priceMinor)))}
              </span>
            ) : null}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {visibleCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <CourseCard {...toCardProps(course)} />
              </motion.div>
            ))}
          </div>
          {hasMore ? (
            <div className="mt-12 text-center">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl"
                disabled={isFetching}
                onClick={() => setVisibleCount((count) => count + pageSize)}
              >
                {isFetching ? "Loading…" : "Load More Courses"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
