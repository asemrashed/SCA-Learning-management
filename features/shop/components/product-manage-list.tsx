"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatBdtMinor } from "@/lib/format-currency"
import { useDeleteProductMutation, useListProductsQuery } from "@/features/shop/api"
import { PRODUCT_TYPE_LABEL } from "@/features/shop/utils"
import { DashboardTable } from "@/components/dashboard-table"
import { TableRowActions } from "@/components/table-row-actions"

export function ProductManageList() {
  const { data, isLoading, error } = useListProductsQuery({
    pageSize: 100,
    sort: "createdAt:desc",
  })
  const [deleteProduct] = useDeleteProductMutation()
  const products = data?.data ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Shop products</h1>
          <p className="text-sm text-muted-foreground">Manage books, notes, and question banks.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            New product
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-destructive">Could not load products.</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No products yet.</p>
      ) : (
        <DashboardTable>
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{product.title}</div>
                    <div className="text-xs text-muted-foreground">{product.slug}</div>
                  </td>
                  <td className="px-4 py-3">{PRODUCT_TYPE_LABEL[product.type]}</td>
                  <td className="px-4 py-3">
                    {product.priceMinor === 0 ? "Free" : formatBdtMinor(product.priceMinor)}
                  </td>
                  <td className="px-4 py-3">
                    {product.isPublished ? "Published" : "Draft"}
                  </td>
                  <td className="px-4 py-3">
                    <TableRowActions
                      actions={[
                        { label: "Edit", href: `/admin/products/${product.id}/edit` },
                        {
                          label: "Delete",
                          destructive: true,
                          onClick: () => {
                            if (confirm("Delete this product?")) {
                              void deleteProduct(product.id)
                            }
                          },
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashboardTable>
      )}
    </div>
  )
}
