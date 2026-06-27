"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  BookOpen,
  GraduationCap,
  Grid3X3,
  Calendar,
  Radio,
  Video,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
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
import { BatchCard } from "@/features/batch/components/BatchCard"
import { formatBdtMinor } from "@/lib/format-currency"
import { useListCoursesQuery } from "@/features/course/api"
import { useListBatchesQuery } from "@/features/batch/api"
import { useListCategoriesQuery } from "@/features/category/api"
import type { CourseListItem } from "@/types/api"
import { DeliveryMode } from "@/types/api"
import {
  BATCHES,
  LIVE_COURSES,
  OUR_COURSES,
  RECORDED_COURSES,
  courseCount,
} from "@/lib/product-vocabulary"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { marketingHeroSection } from "@/lib/marketing-layout"

type CatalogKind = "live-courses" | "live-batches" | "recorded"

const CATALOG_KINDS: {
  id: CatalogKind
  label: string
  description: string
  icon: LucideIcon
}[] = [
  {
    id: "live-courses",
    label: LIVE_COURSES,
    description: "Structured live programs",
    icon: Radio,
  },
  {
    id: "live-batches",
    label: BATCHES,
    description: "Open cohorts you can join",
    icon: Calendar,
  },
  {
    id: "recorded",
    label: RECORDED_COURSES,
    description: "Learn at your own pace",
    icon: Video,
  },
]

interface CourseCatalogProps {
  pageSize?: number
  showHeader?: boolean
}

function parseCatalogKind(value: string | null): CatalogKind {
  if (value === "live-batches" || value === "recorded" || value === "live-courses") {
    return value
  }
  return "live-courses"
}

function toCourseCardProps(course: CourseListItem, isLive: boolean) {
  return {
    id: course.slug || course.id,
    title: course.title,
    image:
      course.thumbnail ??
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
    category: course.category ?? undefined,
    price: course.priceMinor === 0 ? 0 : course.priceMinor / 100,
    isFree: course.priceMinor === 0,
    isLive,
    hidePrice: isLive,
    batchCount: course.batchCount,
    students: course.studentCount,
  }
}

export function CourseCatalog({ pageSize = 12, showHeader = true }: CourseCatalogProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") ?? "all"
  const initialKind = parseCatalogKind(searchParams.get("type"))

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sort, setSort] = useState("createdAt:desc")
  const [catalogKind, setCatalogKind] = useState<CatalogKind>(initialKind)
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [visibleCount, setVisibleCount] = useState(pageSize)

  useEffect(() => {
    setCatalogKind(parseCatalogKind(searchParams.get("type")))
    setActiveCategory(searchParams.get("category") ?? "all")
  }, [searchParams])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [debouncedSearch, sort, activeCategory, catalogKind, pageSize])

  const isBatchCatalog = catalogKind === "live-batches"
  const deliveryMode =
    catalogKind === "recorded" ? DeliveryMode.RECORDED : DeliveryMode.LIVE

  const { data: coursesData, isLoading: coursesLoading, isFetching: coursesFetching, error: coursesError } =
    useListCoursesQuery(
      {
        page: 1,
        pageSize: 100,
        search: debouncedSearch || undefined,
        sort: isBatchCatalog ? undefined : sort,
        deliveryMode,
        category: !isBatchCatalog && activeCategory !== "all" ? activeCategory : undefined,
      },
      { skip: isBatchCatalog },
    )

  const { data: batchesData, isLoading: batchesLoading, isFetching: batchesFetching, error: batchesError } =
    useListBatchesQuery(
      {
        page: 1,
        pageSize: 100,
        search: debouncedSearch || undefined,
        sort: "startDate:asc",
      },
      { skip: !isBatchCatalog },
    )

  const { data: categoriesData } = useListCategoriesQuery({
    pageSize: 100,
    sort: "order:asc",
  })

  const courses = coursesData?.data ?? []
  const batches = batchesData?.data ?? []

  const courseCategories = useMemo(() => {
    const apiCategories = categoriesData?.data ?? []

    const categoryItems = apiCategories.map((cat) => {
      const count =
        catalogKind === "live-batches"
          ? batches.filter((batch) => batch.courseCategory === cat.title).length
          : courses.filter(
              (course) => course.categorySlug === cat.slug || course.category === cat.title,
            ).length

      return {
        id: cat.slug,
        label: cat.title,
        icon: BookOpen,
        subtitle: courseCount(count),
      }
    })

    const totalCount = catalogKind === "live-batches" ? batches.length : courses.length

    return [
      {
        id: "all",
        label: "All",
        icon: Grid3X3,
        subtitle: courseCount(totalCount),
      },
      ...categoryItems.filter((item) => {
        const count = Number.parseInt(item.subtitle, 10)
        return Number.isNaN(count) || count > 0
      }),
    ]
  }, [categoriesData, courses, batches, catalogKind])

  const categories = courseCategories

  const filteredBatches = useMemo(() => {
    if (activeCategory === "all") return batches
    const cat = categoriesData?.data?.find((category) => category.slug === activeCategory)
    if (!cat) return batches
    return batches.filter((batch) => batch.courseCategory === cat.title)
  }, [batches, activeCategory, categoriesData])

  const filteredCourses = useMemo(() => courses, [courses])

  const visibleCourses = filteredCourses.slice(0, visibleCount)
  const visibleBatches = filteredBatches.slice(0, visibleCount)
  const hasMore =
    catalogKind === "live-batches"
      ? visibleCount < filteredBatches.length
      : visibleCount < filteredCourses.length

  const isLoading = isBatchCatalog ? batchesLoading : coursesLoading
  const isFetching = isBatchCatalog ? batchesFetching : coursesFetching
  const error = isBatchCatalog ? batchesError : coursesError

  function handleCatalogKindChange(next: CatalogKind) {
    setCatalogKind(next)
    setActiveCategory("all")
    const params = new URLSearchParams(searchParams.toString())
    params.set("type", next)
    params.delete("category")
    router.replace(`/courses?${params.toString()}`, { scroll: false })
  }

  function handleCategoryChange(next: string) {
    setActiveCategory(next)
    const params = new URLSearchParams(searchParams.toString())
    params.set("type", catalogKind)
    if (next === "all") {
      params.delete("category")
    } else {
      params.set("category", next)
    }
    router.replace(`/courses?${params.toString()}`, { scroll: false })
  }

  const catalogLabel =
    catalogKind === "live-batches"
      ? BATCHES.toLowerCase()
      : catalogKind === "recorded"
        ? RECORDED_COURSES.toLowerCase()
        : LIVE_COURSES.toLowerCase()

  return (
    <div>
      {showHeader ? (
        <section
          className={marketingHeroSection(
            "relative mb-10 overflow-hidden bg-secondary pb-10 text-secondary-foreground md:pb-12",
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 Q15 15 30 30 T60 30' fill='none' stroke='%2371d4cb' stroke-width='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-secondary-foreground md:text-4xl">
              {OUR_COURSES}
            </h1>
            <p className="mx-auto max-w-2xl text-secondary-foreground/80">
              Browse live programs, open batches, and recorded courses in one place
            </p>
          </motion.div>
        </section>
      ) : null}

      <div className="container mx-auto px-4 pb-10 pt-2 md:pb-14">
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CATALOG_KINDS.map((kind) => {
          const Icon = kind.icon
          const active = catalogKind === kind.id
          return (
            <button
              key={kind.id}
              type="button"
              onClick={() => handleCatalogKindChange(kind.id)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-colors",
                active
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:bg-muted/60",
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    active ? "bg-primary text-secondary" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-semibold text-foreground">{kind.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{kind.description}</p>
            </button>
          )
        })}
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${catalogLabel}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl pl-9"
          />
        </div>
        {!isBatchCatalog ? (
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
        ) : null}
      </div>

      {categories.length > 0 ? (
        <CategoryNav
          items={categories}
          activeId={activeCategory}
          onChange={handleCategoryChange}
          className="mb-10"
        />
      ) : null}

      {error ? (
        <p className="py-12 text-center text-destructive">Could not load {catalogLabel}.</p>
      ) : isLoading ? (
        <p className="py-12 text-center text-muted-foreground">Loading {catalogLabel}…</p>
      ) : catalogKind === "live-batches" ? (
        visibleBatches.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No {catalogLabel} found.</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Showing {visibleBatches.length} of {filteredBatches.length} {catalogLabel}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {visibleBatches.map((batch, index) => (
                <motion.div
                  key={batch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <BatchCard batch={batch} />
                </motion.div>
              ))}
            </div>
          </>
        )
      ) : visibleCourses.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No {catalogLabel} found.</p>
      ) : (
        <>
          <p className="mb-6 text-sm text-muted-foreground">
            Showing {visibleCourses.length} of {filteredCourses.length} {catalogLabel}
            {visibleCourses.some((c) => c.priceMinor > 0) ? (
              <span className="sr-only">
                {" "}
                — prices from {formatBdtMinor(Math.min(...visibleCourses.map((c) => c.priceMinor)))}
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
                <CourseCard
                  {...toCourseCardProps(course, catalogKind === "live-courses")}
                />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {hasMore ? (
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl"
            disabled={isFetching}
            onClick={() => setVisibleCount((count) => count + pageSize)}
          >
            {isFetching ? "Loading…" : `Load more ${catalogLabel}`}
          </Button>
        </div>
      ) : null}
      </div>
    </div>
  )
}
