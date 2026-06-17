"use client"

import Link from "next/link"
import { ArrowRight, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useListCategoriesQuery } from "@/features/category/api"
import { CategoryCard } from "@/features/category/components/category-card"

const HOME_CATEGORY_LIMIT = 6

export function LearningCategories() {
  const { data, isLoading, error } = useListCategoriesQuery({
    pageSize: 100,
    sort: "order:asc",
  })

  const categories = (data?.data ?? []).slice(0, HOME_CATEGORY_LIMIT)

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

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading categories…</p>
        ) : error ? (
          <p className="text-center text-destructive">Could not load categories.</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-muted-foreground">No categories available yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-[repeat(24,minmax(0,1fr))]">
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
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
          <Button
            size="lg"
            className="rounded-full bg-secondary px-8 text-secondary-foreground hover:bg-secondary/90"
            asChild
          >
            <Link href="/categories">
              See All Category
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
