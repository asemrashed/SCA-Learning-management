"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, ShoppingBag } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProductCard } from "@/features/shop/components/product-card"
import { useListProductsQuery } from "@/features/shop/api"
import { PRODUCT_TYPE_LABEL } from "@/features/shop/utils"
import { ProductType } from "@/types/api"

export function ShopCatalog() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sort, setSort] = useState("createdAt:desc")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, error } = useListProductsQuery({
    page: 1,
    pageSize: 100,
    search: debouncedSearch || undefined,
    type: typeFilter === "all" ? undefined : (typeFilter as ProductType),
    sort,
  })

  const products = useMemo(() => data?.data ?? [], [data])

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <ShoppingBag className="h-4 w-4" />
          Shop
        </div>
        <h1 className="text-3xl font-bold md:text-4xl">Study materials</h1>
        <p className="mt-2 text-muted-foreground">
          Books, notes, and question banks for your preparation.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.values(ProductType).map((type) => (
              <SelectItem key={type} value={type}>
                {PRODUCT_TYPE_LABEL[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt:desc">Newest</SelectItem>
            <SelectItem value="priceMinor:asc">Price: low to high</SelectItem>
            <SelectItem value="priceMinor:desc">Price: high to low</SelectItem>
            <SelectItem value="title:asc">Title A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading products…</p>
      ) : error ? (
        <p className="text-center text-destructive">Could not load products.</p>
      ) : products.length === 0 ? (
        <p className="text-center text-muted-foreground">No products found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
