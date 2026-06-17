"use client"

import { LayoutGrid } from "lucide-react"
import { motion } from "framer-motion"
import { useListCategoriesQuery } from "@/features/category/api"
import { CategoryCard } from "@/features/category/components/category-card"

export function CategoryCatalog() {
  const { data, isLoading, error } = useListCategoriesQuery({
    pageSize: 100,
    sort: "order:asc",
  })

  const categories = data?.data ?? []

  return (
    <main className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <div className="mb-4 flex items-center justify-center gap-2">
          <LayoutGrid className="h-5 w-5 text-secondary" />
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">All Categories</h1>
        </div>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Browse BBA, MBA, and other business programs by category
        </p>
      </motion.div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading categories…</p>
      ) : error ? (
        <p className="text-center text-destructive">Could not load categories.</p>
      ) : categories.length === 0 ? (
        <p className="text-center text-muted-foreground">No categories available yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-[repeat(24,minmax(0,1fr))]">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} animate={false} />
          ))}
        </div>
      )}
    </main>
  )
}
