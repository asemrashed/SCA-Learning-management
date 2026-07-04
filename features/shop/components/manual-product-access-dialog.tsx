"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DashboardTable } from "@/components/dashboard-table"
import { useLazySearchEnrollmentStudentsQuery } from "@/features/enrollment/api"
import {
  useGrantManualProductAccessMutation,
  useListProductsQuery,
} from "@/features/shop/api"
import { PRODUCT_TYPE_LABEL } from "@/features/shop/utils"
import { formatBdtMinor } from "@/lib/format-currency"
import { ProductType, type EnrollmentStudentSearchResult, type ProductListItem } from "@/types/api"

interface ManualProductAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function StudentSuggestions({
  results,
  onSelect,
  visible,
}: {
  results: EnrollmentStudentSearchResult[]
  onSelect: (student: EnrollmentStudentSearchResult) => void
  visible: boolean
}) {
  if (!visible || results.length === 0) return null

  return (
    <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover py-1 shadow-md">
      {results.map((student) => (
        <li key={student.id}>
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
            onClick={() => onSelect(student)}
          >
            <span className="font-medium">{student.name}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {student.phone}
              {student.email ? ` · ${student.email}` : ""}
              {student.idNumber ? ` · ID ${student.idNumber}` : ""}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function monthBounds(monthValue: string): { dateFrom: string; dateTo: string } | null {
  if (!monthValue) return null
  const [year, month] = monthValue.split("-").map(Number)
  if (!year || !month) return null
  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
  return { dateFrom: start.toISOString(), dateTo: end.toISOString() }
}

function monthOptions(): { value: string; label: string }[] {
  const year = new Date().getFullYear()
  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0")
    const value = `${year}-${month}`
    const label = new Date(year, index, 1).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    })
    return { value, label }
  })
}

export function ManualProductAccessDialog({ open, onOpenChange }: ManualProductAccessDialogProps) {
  const [studentId, setStudentId] = useState<string | undefined>()
  const [studentName, setStudentName] = useState("")
  const [nameSearch, setNameSearch] = useState("")
  const [showNameSuggestions, setShowNameSuggestions] = useState(false)
  const [typeFilter, setTypeFilter] = useState<ProductType | "ALL">("ALL")
  const [monthFilter, setMonthFilter] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const nameFieldRef = useRef<HTMLDivElement>(null)

  const [searchStudents, { data: nameSearchData }] = useLazySearchEnrollmentStudentsQuery()
  const monthRange = useMemo(() => monthBounds(monthFilter), [monthFilter])

  const { data: productsData, isLoading: productsLoading } = useListProductsQuery(
    {
      page: 1,
      pageSize: 100,
      search: productSearch.trim() || undefined,
      type: typeFilter === "ALL" ? undefined : typeFilter,
      dateFrom: monthRange?.dateFrom,
      dateTo: monthRange?.dateTo,
      sort: "createdAt:desc",
    },
    { skip: !open },
  )

  const [grantAccess, { isLoading: granting }] = useGrantManualProductAccessMutation()

  const nameResults = nameSearchData?.data ?? []
  const products = (productsData?.data ?? []).filter((p) => p.isPublished)
  const selectedProducts = products.filter((p) => selectedIds.includes(p.id))
  const totalMinor = selectedProducts.reduce((sum, p) => sum + p.priceMinor, 0)

  useEffect(() => {
    if (!open) return
    setStudentId(undefined)
    setStudentName("")
    setNameSearch("")
    setTypeFilter("ALL")
    setMonthFilter("")
    setProductSearch("")
    setSelectedIds([])
    setFormError(null)
    setConfirmOpen(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => {
      const term = nameSearch.trim()
      if (term.length >= 1) {
        void searchStudents({ search: term, limit: 8 })
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [nameSearch, open, searchStudents])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (nameFieldRef.current && !nameFieldRef.current.contains(event.target as Node)) {
        setShowNameSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function applyStudent(student: EnrollmentStudentSearchResult) {
    setStudentId(student.id)
    setStudentName(student.name)
    setNameSearch(student.name)
    setShowNameSuggestions(false)
  }

  function toggleProduct(product: ProductListItem) {
    setSelectedIds((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id],
    )
  }

  function removeSelected(productId: string) {
    setSelectedIds((prev) => prev.filter((id) => id !== productId))
  }

  function openConfirm() {
    setFormError(null)
    if (!studentId) {
      setFormError("Select a student from search suggestions.")
      return
    }
    if (selectedIds.length === 0) {
      setFormError("Select at least one product.")
      return
    }
    setConfirmOpen(true)
  }

  async function handleGrant() {
    if (!studentId || selectedIds.length === 0) return
    setFormError(null)
    try {
      await grantAccess({ studentId, productIds: selectedIds }).unwrap()
      setConfirmOpen(false)
      onOpenChange(false)
    } catch {
      setFormError("Could not grant access. Check stock and try again.")
      setConfirmOpen(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Give product access</DialogTitle>
            <DialogDescription>
              Sell products manually after payment by phone. The student will get immediate access
              without sending a shop request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div ref={nameFieldRef} className="relative space-y-2">
              <Label htmlFor="manual-access-student">Student</Label>
              <Input
                id="manual-access-student"
                value={nameSearch}
                onChange={(e) => {
                  setNameSearch(e.target.value)
                  setStudentName(e.target.value)
                  setStudentId(undefined)
                  setShowNameSuggestions(true)
                }}
                onFocus={() => setShowNameSuggestions(true)}
                placeholder="Search student by name"
                autoComplete="off"
              />
              <StudentSuggestions
                results={nameResults}
                visible={showNameSuggestions && nameSearch.trim().length >= 1}
                onSelect={applyStudent}
              />
              {studentId ? (
                <p className="text-xs text-muted-foreground">Selected: {studentName}</p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={typeFilter}
                  onValueChange={(value) => setTypeFilter(value as ProductType | "ALL")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All categories</SelectItem>
                    {(Object.keys(PRODUCT_TYPE_LABEL) as ProductType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {PRODUCT_TYPE_LABEL[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Added in month</Label>
                <Select
                  value={monthFilter || "ALL"}
                  onValueChange={(value) => setMonthFilter(value === "ALL" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Any date</SelectItem>
                    {monthOptions().map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-search">Search products</Label>
                <Input
                  id="product-search"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Title…"
                />
              </div>
            </div>

            {selectedProducts.length > 0 ? (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="mb-2 text-sm font-medium">Selected ({selectedProducts.length})</p>
                <ul className="space-y-1 text-sm">
                  {selectedProducts.map((product) => (
                    <li key={product.id} className="flex items-center justify-between gap-2">
                      <span>
                        {product.title} · {formatBdtMinor(product.priceMinor)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => removeSelected(product.id)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm font-medium text-primary">
                  Total: {formatBdtMinor(totalMinor)}
                </p>
              </div>
            ) : null}

            {productsLoading ? (
              <p className="text-sm text-muted-foreground">Loading products…</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products match your filters.</p>
            ) : (
              <DashboardTable>
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="w-10 px-3 py-2" />
                      <th className="px-3 py-2 font-medium">Product</th>
                      <th className="px-3 py-2 font-medium">Category</th>
                      <th className="px-3 py-2 font-medium">Price</th>
                      <th className="px-3 py-2 font-medium">Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const checked = selectedIds.includes(product.id)
                      return (
                        <tr key={product.id} className="border-t">
                          <td className="px-3 py-2">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleProduct(product)}
                              aria-label={`Select ${product.title}`}
                            />
                          </td>
                          <td className="px-3 py-2 font-medium">{product.title}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {PRODUCT_TYPE_LABEL[product.type]}
                          </td>
                          <td className="px-3 py-2">{formatBdtMinor(product.priceMinor)}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </DashboardTable>
            )}

            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={openConfirm} disabled={!studentId || selectedIds.length === 0}>
              Give access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm access</DialogTitle>
            <DialogDescription>
              Grant {selectedProducts.length} product
              {selectedProducts.length === 1 ? "" : "s"} to {studentName || "this student"}?
            </DialogDescription>
          </DialogHeader>
          <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
            {selectedProducts.map((product) => (
              <li key={product.id}>
                {product.title} · {formatBdtMinor(product.priceMinor)}
              </li>
            ))}
          </ul>
          <p className="text-sm font-medium">Total collected: {formatBdtMinor(totalMinor)}</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
              Back
            </Button>
            <Button type="button" onClick={() => void handleGrant()} disabled={granting}>
              {granting ? "Granting…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
