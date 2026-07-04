"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { DashboardTable } from "@/components/dashboard-table"
import { TableRowActions } from "@/components/table-row-actions"
import { useLazySearchEnrollmentStudentsQuery } from "@/features/enrollment/api"
import {
  useListStudentProductAccessQuery,
  useUpdateProductAccessMutation,
} from "@/features/shop/api"
import {
  PRODUCT_ACCESS_SOURCE_LABEL,
  PRODUCT_ACCESS_STATUS_LABEL,
  PRODUCT_TYPE_LABEL,
} from "@/features/shop/utils"
import { formatBdtMinor } from "@/lib/format-currency"
import {
  ProductAccessStatus,
  type AdminProductAccessItem,
  type EnrollmentStudentSearchResult,
  type UpdateProductAccessInput,
} from "@/types/api"

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
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function statusBadgeVariant(
  status: ProductAccessStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case ProductAccessStatus.ACTIVE:
      return "default"
    case ProductAccessStatus.BLOCKED:
      return "secondary"
    case ProductAccessStatus.WITHDRAWN:
      return "destructive"
    default:
      return "outline"
  }
}

export function CheckProductAccessPanel() {
  const [studentId, setStudentId] = useState<string | undefined>()
  const [studentName, setStudentName] = useState("")
  const [nameSearch, setNameSearch] = useState("")
  const [showNameSuggestions, setShowNameSuggestions] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<{
    item: AdminProductAccessItem
    action: UpdateProductAccessInput["action"]
  } | null>(null)
  const nameFieldRef = useRef<HTMLDivElement>(null)

  const [searchStudents, { data: nameSearchData }] = useLazySearchEnrollmentStudentsQuery()
  const { data, isLoading, error } = useListStudentProductAccessQuery(
    { studentId: studentId! },
    { skip: !studentId },
  )
  const [updateAccess, { isLoading: updating }] = useUpdateProductAccessMutation()

  const nameResults = nameSearchData?.data ?? []
  const accessItems = data?.data ?? []

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const term = nameSearch.trim()
      if (term.length >= 1) {
        void searchStudents({ search: term, limit: 8 })
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [nameSearch, searchStudents])

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
    setActionError(null)
  }

  function actionsForItem(item: AdminProductAccessItem) {
    const actions: {
      label: string
      destructive?: boolean
      disabled?: boolean
      onClick: () => void
    }[] = []

    if (item.status === ProductAccessStatus.ACTIVE) {
      actions.push({
        label: "Block",
        onClick: () => setConfirmTarget({ item, action: "block" }),
      })
      actions.push({
        label: "Withdraw",
        destructive: true,
        onClick: () => setConfirmTarget({ item, action: "withdraw" }),
      })
    } else if (item.status === ProductAccessStatus.BLOCKED) {
      actions.push({
        label: "Unblock",
        onClick: () => setConfirmTarget({ item, action: "unblock" }),
      })
      actions.push({
        label: "Withdraw",
        destructive: true,
        onClick: () => setConfirmTarget({ item, action: "withdraw" }),
      })
    }

    return actions
  }

  async function handleConfirmAction() {
    if (!confirmTarget || !studentId) return
    setActionError(null)
    try {
      await updateAccess({
        id: confirmTarget.item.id,
        body: { action: confirmTarget.action },
        studentId,
      }).unwrap()
      setConfirmTarget(null)
    } catch {
      setActionError("Could not update access. Try again.")
      setConfirmTarget(null)
    }
  }

  const confirmLabels: Record<UpdateProductAccessInput["action"], string> = {
    block: "Block access",
    unblock: "Unblock access",
    withdraw: "Withdraw access",
  }

  return (
    <div className="space-y-4">
      <div ref={nameFieldRef} className="relative max-w-md space-y-2">
        <Label htmlFor="check-access-student">Student</Label>
        <Input
          id="check-access-student"
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
      </div>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      {!studentId ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          Search and select a student to view their product access.
        </div>
      ) : isLoading ? (
        <p className="text-muted-foreground">Loading access records…</p>
      ) : error ? (
        <p className="text-destructive">Could not load product access.</p>
      ) : accessItems.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          {studentName} has no shop product access yet.
        </div>
      ) : (
        <DashboardTable>
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Granted</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accessItems.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{item.product.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {PRODUCT_TYPE_LABEL[item.product.type]}
                  </td>
                  <td className="px-4 py-3">{formatBdtMinor(item.product.priceMinor)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {PRODUCT_ACCESS_SOURCE_LABEL[item.source] ?? item.source}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(item.grantedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(item.status)}>
                      {PRODUCT_ACCESS_STATUS_LABEL[item.status] ?? item.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <TableRowActions actions={actionsForItem(item).map((a) => ({ ...a, disabled: updating }))} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashboardTable>
      )}

      <Dialog open={confirmTarget != null} onOpenChange={(open) => !open && setConfirmTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{confirmTarget ? confirmLabels[confirmTarget.action] : "Confirm"}</DialogTitle>
            <DialogDescription>
              {confirmTarget
                ? `${confirmLabels[confirmTarget.action]} for "${confirmTarget.item.product.title}"?`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={confirmTarget?.action === "withdraw" ? "destructive" : "default"}
              onClick={() => void handleConfirmAction()}
              disabled={updating}
            >
              {updating ? "Saving…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
