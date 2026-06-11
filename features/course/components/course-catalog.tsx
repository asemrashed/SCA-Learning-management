"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
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
import { formatBdtMinor } from "@/lib/format-currency"
import { useListCoursesQuery } from "@/features/course/api"
import type { CourseListItem } from "@/types/api"

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
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [sort, setSort] = useState("createdAt:desc")

  const { data, isLoading, isFetching, error } = useListCoursesQuery({
    page,
    pageSize,
    search: debouncedSearch || undefined,
    category: category === "all" ? undefined : category,
    sort,
  })

  const [accumulated, setAccumulated] = useState<CourseListItem[]>([])

  useEffect(() => {
    if (!data?.data) return
    setAccumulated((prev) => (page === 1 ? data.data : [...prev, ...data.data]))
  }, [data, page])

  useEffect(() => {
    setPage(1)
    setAccumulated([])
  }, [debouncedSearch, category, sort])

  const courses = accumulated
  const total = data?.meta.total ?? 0
  const hasMore = page * pageSize < total

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const c of courses) {
      if (c.category) set.add(c.category)
    }
    return Array.from(set).sort()
  }, [courses])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setDebouncedSearch(search.trim())
    setPage(1)
  }

  return (
    <div>
      {showHeader ? (
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            Explore Our Courses
          </h1>
          <p className="text-muted-foreground">
            Self-paced courses backed by real curriculum data
          </p>
        </div>
      ) : null}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl pl-9"
          />
        </form>
        <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1) }}>
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
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={category === "all" ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => { setCategory("all"); setPage(1) }}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => { setCategory(cat); setPage(1) }}
            >
              {cat}
            </Button>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="py-12 text-center text-destructive">Could not load courses.</p>
      ) : isLoading ? (
        <p className="py-12 text-center text-muted-foreground">Loading courses…</p>
      ) : courses.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No courses found.</p>
      ) : (
        <>
          <p className="mb-6 text-sm text-muted-foreground">
            Showing {courses.length} of {total} courses
            {courses.some((c) => c.priceMinor > 0) ? (
              <span className="sr-only"> — prices from {formatBdtMinor(Math.min(...courses.map((c) => c.priceMinor)))}</span>
            ) : null}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} {...toCardProps(course)} />
            ))}
          </div>
          {hasMore ? (
            <div className="mt-12 text-center">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl"
                disabled={isFetching}
                onClick={() => setPage((p) => p + 1)}
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
