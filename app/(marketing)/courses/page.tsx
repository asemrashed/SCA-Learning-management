"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CourseCard } from "@/components/course-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, Grid3X3, List, Code, Briefcase, TrendingUp, Database, Palette } from "lucide-react"
import { motion } from "framer-motion"

const categories = [
  { id: "all", label: "All", icon: Grid3X3 },
  { id: "web", label: "Web & App Development", icon: Code },
  { id: "product", label: "Product Management & Design", icon: Briefcase },
  { id: "business", label: "Business & Marketing", icon: TrendingUp },
  { id: "data", label: "Data Engineering", icon: Database },
  { id: "creative", label: "Creatives", icon: Palette },
]

const courses = [
  {
    id: "1",
    title: "Full Stack Web Development with Python, Django & React",
    image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=250&fit=crop",
    batch: "Batch 7",
    seatsLeft: 36,
    daysLeft: 20,
    price: 299,
    originalPrice: 499,
    rating: 4.8,
    students: 5320,
    duration: "6 months",
    category: "Web & App Development",
    isLive: true,
  },
  {
    id: "2",
    title: "App Development with Flutter & AI Integration",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
    batch: "Batch 13",
    seatsLeft: 5,
    daysLeft: 6,
    price: 349,
    originalPrice: 549,
    rating: 4.9,
    students: 3240,
    duration: "5 months",
    category: "Web & App Development",
    isLive: true,
  },
  {
    id: "3",
    title: "Full Stack Web Development with ASP.Net Core",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
    batch: "Batch 8",
    seatsLeft: 39,
    daysLeft: 10,
    price: 279,
    originalPrice: 449,
    rating: 4.7,
    students: 2890,
    duration: "6 months",
    category: "Web & App Development",
    isLive: true,
  },
  {
    id: "4",
    title: "Full Stack Web Development with PHP, Laravel & Vue.js",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop",
    batch: "Batch 10",
    seatsLeft: 36,
    daysLeft: 11,
    price: 259,
    originalPrice: 429,
    rating: 4.6,
    students: 4120,
    duration: "5 months",
    category: "Web & App Development",
    isLive: true,
  },
  {
    id: "5",
    title: "Data Analytics & Business Intelligence Masterclass",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
    batch: "Batch 5",
    seatsLeft: 22,
    daysLeft: 15,
    price: 399,
    originalPrice: 599,
    rating: 4.8,
    students: 2150,
    duration: "4 months",
    category: "Data Engineering",
    isLive: true,
  },
  {
    id: "6",
    title: "Product Management: From Zero to Product Leader",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    batch: "Batch 4",
    seatsLeft: 18,
    daysLeft: 8,
    price: 449,
    originalPrice: 699,
    rating: 4.9,
    students: 1890,
    duration: "4 months",
    category: "Product Management & Design",
    isLive: true,
  },
  {
    id: "7",
    title: "Digital Marketing & Growth Hacking Bootcamp",
    image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=250&fit=crop",
    batch: "Batch 6",
    seatsLeft: 28,
    daysLeft: 12,
    price: 329,
    originalPrice: 499,
    rating: 4.7,
    students: 3560,
    duration: "3 months",
    category: "Business & Marketing",
    isLive: true,
  },
  {
    id: "8",
    title: "UI/UX Design Career Track Program",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=250&fit=crop",
    batch: "Batch 9",
    seatsLeft: 15,
    daysLeft: 5,
    price: 379,
    originalPrice: 579,
    rating: 4.8,
    students: 2780,
    duration: "5 months",
    category: "Creatives",
    isLive: true,
  },
  {
    id: "9",
    title: "Machine Learning & AI Fundamentals",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop",
    batch: "Batch 3",
    seatsLeft: 42,
    daysLeft: 18,
    price: 499,
    originalPrice: 799,
    rating: 4.9,
    students: 1560,
    duration: "6 months",
    category: "Data Engineering",
    isLive: true,
  },
  {
    id: "10",
    title: "Complete DevOps Engineering Course",
    image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=250&fit=crop",
    batch: "Batch 5",
    seatsLeft: 31,
    daysLeft: 14,
    price: 359,
    originalPrice: 549,
    rating: 4.7,
    students: 1980,
    duration: "4 months",
    category: "Web & App Development",
    isLive: true,
  },
  {
    id: "11",
    title: "Financial Modeling & Valuation",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
    batch: "Batch 2",
    seatsLeft: 25,
    daysLeft: 9,
    price: 429,
    originalPrice: 649,
    rating: 4.8,
    students: 1340,
    duration: "3 months",
    category: "Business & Marketing",
    isLive: true,
  },
  {
    id: "12",
    title: "Graphic Design & Brand Identity",
    image: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=400&h=250&fit=crop",
    batch: "Batch 7",
    seatsLeft: 20,
    daysLeft: 16,
    price: 289,
    originalPrice: 449,
    rating: 4.6,
    students: 2450,
    duration: "4 months",
    category: "Creatives",
    isLive: true,
  },
]

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      activeCategory === "all" || course.category.toLowerCase().includes(activeCategory.toLowerCase())
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
              Explore Our Courses
            </h1>
            <p className="text-muted-foreground">
              Discover our comprehensive catalog of live and recorded courses
            </p>
          </motion.div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            {/* Search and Sort */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <Select defaultValue="popular">
                  <SelectTrigger className="w-40 rounded-xl">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.id)}
                  className="rounded-xl"
                >
                  <category.icon className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                  <span className="sm:hidden">{category.label.split(" ")[0]}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredCourses.length}</span> courses
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <CourseCard {...course} />
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          {filteredCourses.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <Button variant="outline" size="lg" className="rounded-xl">
                Load More Courses
              </Button>
            </motion.div>
          )}

          {/* No Results */}
          {filteredCourses.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">No courses found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
