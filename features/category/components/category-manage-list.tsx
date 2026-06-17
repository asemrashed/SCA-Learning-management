"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDeleteCategoryMutation, useListCategoriesQuery } from "@/features/category/api"

export function CategoryManageList() {
  const { data, isLoading, error } = useListCategoriesQuery({
    pageSize: 100,
    sort: "order:asc",
  })
  const [deleteCategory] = useDeleteCategoryMutation()
  const categories = data?.data ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Course categories</h1>
          <p className="text-sm text-muted-foreground">
            Organize BBA, MBA, and other programs shown on the homepage.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            New category
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-destructive">Could not load categories.</p>
      ) : categories.length === 0 ? (
        <p className="text-muted-foreground">No categories yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Courses</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{category.title}</div>
                    <div className="text-xs text-muted-foreground">{category.slug}</div>
                    {category.shortIntro ? (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {category.shortIntro}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{category.courseCount}</td>
                  <td className="px-4 py-3">{category.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/categories/${category.id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Delete this category? Linked courses will be uncategorized.")) {
                            void deleteCategory(category.id)
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
