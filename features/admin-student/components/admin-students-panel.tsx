"use client"

import { useEffect, useMemo, useState } from "react"
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { DashboardTable } from "@/components/dashboard-table"
import { TableRowActions } from "@/components/table-row-actions"
import { useListBatchesByCourseQuery, useListBatchesQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"
import {
  useDeleteAdminStudentMutation,
  useLazyListAdminStudentsQuery,
  useListAdminStudentsQuery,
  useSetAdminStudentEnrollmentBlockMutation,
  useUpdateAdminStudentMutation,
} from "@/features/admin-student/api"
import { downloadCsv, printTableAsPdf } from "@/lib/export-table"
import { formatBdtMinor } from "@/lib/format-currency"
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import { formatStudentId } from "@/lib/student-id"
import { DeliveryMode, EnrollmentStatus, type AdminStudentListItem } from "@/types/api"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20

const STUDENT_EXPORT_HEADERS = [
  "#",
  "Name",
  "Phone",
  "Student ID",
  "Email",
  "Course",
  "Batch",
  "Paid",
  "Total",
  "Status",
]

function studentStatusLabel(item: AdminStudentListItem): string {
  const parts: string[] = []
  if (!item.isActive) parts.push("Inactive")
  if (item.isBlocked) parts.push("Blocked")
  if (parts.length === 0) parts.push(item.status)
  return parts.join(", ")
}

function studentExportRows(items: AdminStudentListItem[]): string[][] {
  return items.map((item, index) => {
    const showBatch = item.course?.deliveryMode === DeliveryMode.LIVE && item.batch
    return [
      String(index + 1),
      item.name,
      item.phone,
      formatStudentId(item.idNumber, item.id),
      item.email ?? "—",
      item.course?.title ?? "—",
      showBatch ? item.batch!.title : "—",
      formatBdtMinor(item.paidAmountMinor),
      formatBdtMinor(item.totalAmountMinor),
      studentStatusLabel(item),
    ]
  })
}

function exportFilenameStem(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
}

function apiErrorMessage(err: unknown, fallback: string): string {
  const apiErr = err as { data?: { error?: { message?: string } } }
  return apiErr.data?.error?.message ?? fallback
}

export function AdminStudentsPanel() {
  const [page, setPage] = useState(1)
  const [courseId, setCourseId] = useState("")
  const [batchId, setBatchId] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)

  const [editTarget, setEditTarget] = useState<AdminStudentListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminStudentListItem | null>(null)

  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null)

  const { data: coursesData } = useListCoursesQuery({ pageSize: 100 })
  const { data: batchesData } = useListBatchesQuery({ pageSize: 100 })
  const { data: courseBatchesData } = useListBatchesByCourseQuery(courseId, {
    skip: !courseId,
  })

  const listParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      courseId: courseId || undefined,
      batchId: batchId || undefined,
      search: search.trim() || undefined,
    }),
    [page, courseId, batchId, search],
  )

  const { data, isLoading, error, isFetching } = useListAdminStudentsQuery(listParams)
  const [fetchStudentsPage] = useLazyListAdminStudentsQuery()
  const [updateStudent, { isLoading: updating }] = useUpdateAdminStudentMutation()
  const [deleteStudent, { isLoading: deleting }] = useDeleteAdminStudentMutation()
  const [setEnrollmentBlock, { isLoading: blocking }] =
    useSetAdminStudentEnrollmentBlockMutation()

  const students = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1

  const batchOptions = courseId ? (courseBatchesData?.data ?? []) : (batchesData?.data ?? [])

  const courseLabel = useMemo(() => {
    if (!courseId) return "All courses"
    return (coursesData?.data ?? []).find((c) => c.id === courseId)?.title ?? "Selected course"
  }, [courseId, coursesData?.data])

  const batchLabel = useMemo(() => {
    if (!batchId) return "All batches"
    return batchOptions.find((b) => b.id === batchId)?.title ?? "Selected batch"
  }, [batchId, batchOptions])

  const exportFilterParams = useMemo(
    () => ({
      courseId: courseId || undefined,
      batchId: batchId || undefined,
      search: search.trim() || undefined,
    }),
    [courseId, batchId, search],
  )

  async function fetchAllStudents(): Promise<AdminStudentListItem[]> {
    const pageSize = PAGE_SIZE
    const all: AdminStudentListItem[] = []
    let page = 1
    for (;;) {
      const res = await fetchStudentsPage({ ...exportFilterParams, pageSize, page }, false).unwrap()
      all.push(...res.data)
      const total = res.meta?.total ?? all.length
      if (res.data.length === 0 || all.length >= total) break
      page += 1
    }
    return all
  }

  function buildExportMeta(total: number): string[][] {
    return [
      ["Course", courseLabel],
      ["Batch", batchLabel],
      ...(search.trim() ? [["Search", search.trim()]] : []),
      ["Total students", String(total)],
    ]
  }

  async function handleExport(format: "pdf" | "excel") {
    setActionError(null)
    setExporting(format)
    try {
      const rows = await fetchAllStudents()
      if (rows.length === 0) {
        setActionError("No students to export for the current filters.")
        return
      }
      const body = studentExportRows(rows)
      const subtitle = [
        `Course: ${courseLabel}`,
        `Batch: ${batchLabel}`,
        ...(search.trim() ? [`Search: ${search.trim()}`] : []),
      ]
      const filename = `students-${exportFilenameStem()}`

      if (format === "excel") {
        downloadCsv(`${filename}.csv`, STUDENT_EXPORT_HEADERS, body, buildExportMeta(rows.length))
      } else {
        printTableAsPdf({
          title: "Students",
          subtitle,
          headers: STUDENT_EXPORT_HEADERS,
          rows: body,
        })
      }
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not prepare the download. Try again."))
    } finally {
      setExporting(null)
    }
  }

  useEffect(() => {
    setBatchId("")
  }, [courseId])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (!editTarget) return
    setEditName(editTarget.name)
    setEditPhone(editTarget.phone)
    setEditEmail(editTarget.email ?? "")
  }, [editTarget])

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    setActionError(null)
    try {
      await updateStudent({
        id: editTarget.id,
        body: {
          name: editName,
          phone: editPhone,
          email: editEmail.trim() || null,
        },
      }).unwrap()
      setEditTarget(null)
    } catch (err) {
      setActionError(apiErrorMessage(err, "Could not update student."))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setActionError(null)
    try {
      await deleteStudent(deleteTarget.id).unwrap()
      setDeleteTarget(null)
    } catch (err) {
      setActionError(apiErrorMessage(err, "Could not delete student."))
    }
  }

  async function handleBlockToggle(item: AdminStudentListItem) {
    setActionError(null)
    try {
      await setEnrollmentBlock({
        enrollmentId: item.enrollmentId,
        blocked: !item.isBlocked,
      }).unwrap()
    } catch (err) {
      setActionError(
        apiErrorMessage(err, item.isBlocked ? "Could not unblock student." : "Could not block student."),
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:max-w-3xl">
        <Select
          value={courseId || "all"}
          onValueChange={(value) => {
            setCourseId(value === "all" ? "" : value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:flex-1">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {(coursesData?.data ?? []).map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={batchId || "all"}
          onValueChange={(value) => {
            setBatchId(value === "all" ? "" : value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:flex-1">
            <SelectValue placeholder="Batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All batches</SelectItem>
            {batchOptions.map((batch) => (
              <SelectItem key={batch.id} value={batch.id}>
                {batch.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          className="w-full sm:flex-1"
          placeholder="Search name or ID"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={exporting !== null || isLoading}
            onClick={() => void handleExport("pdf")}
          >
            {exporting === "pdf" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={exporting !== null || isLoading}
            onClick={() => void handleExport("excel")}
          >
            {exporting === "excel" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            )}
            Download Excel
          </Button>
        </div>
      </div>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      {isLoading ? (
        <p className="text-muted-foreground">Loading students…</p>
      ) : error ? (
        <p className="text-destructive">Could not load students.</p>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No students found.
        </div>
      ) : (
        <div className="space-y-4">
          <DashboardTable>
            <table className="w-full min-w-[960px] text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Batch</th>
                  <th className="px-4 py-3 font-medium">Paid / Total</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((item) => {
                  const studentId = formatStudentId(item.idNumber, item.id)
                  const showBatch = item.course?.deliveryMode === DeliveryMode.LIVE && item.batch
                  return (
                    <tr key={item.enrollmentId} className="border-t">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {item.avatarUrl ? (
                              <AvatarImage src={item.avatarUrl} alt={item.name} />
                            ) : null}
                            <AvatarFallback>{initialsFromName(item.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.phone}
                              {!item.isActive ? " · Inactive" : ""}
                              {item.isBlocked ? " · Blocked" : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{studentId}</td>
                      <td className="px-4 py-3">{item.course?.title ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {showBatch ? item.batch!.title : "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatBdtMinor(item.paidAmountMinor)}
                        <span className="text-muted-foreground"> / </span>
                        {formatBdtMinor(item.totalAmountMinor)}
                      </td>
                      <td className="px-4 py-3">
                        <TableRowActions
                          actions={[
                            {
                              label: "Edit",
                              onClick: () => {
                                setActionError(null)
                                setEditTarget(item)
                              },
                            },
                            {
                              label: item.isBlocked ? "Unblock" : "Block",
                              disabled: blocking || item.status !== EnrollmentStatus.ACTIVE,
                              onClick: () => {
                                void handleBlockToggle(item)
                              },
                            },
                            {
                              label: "Delete",
                              destructive: true,
                              onClick: () => {
                                setActionError(null)
                                setDeleteTarget(item)
                              },
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </DashboardTable>

          {meta && meta.total > PAGE_SIZE ? (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(meta.page - 1) * meta.pageSize + 1}–
                {Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total}
                {isFetching ? " · Updating…" : ""}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      className={cn(page <= 1 && "pointer-events-none opacity-50")}
                      onClick={(e) => {
                        e.preventDefault()
                        if (page > 1) setPage((p) => p - 1)
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-3 text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      className={cn(page >= totalPages && "pointer-events-none opacity-50")}
                      onClick={(e) => {
                        e.preventDefault()
                        if (page < totalPages) setPage((p) => p + 1)
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          ) : meta ? (
            <p className="text-sm text-muted-foreground">
              Showing {meta.total} student{meta.total === 1 ? "" : "s"}
              {isFetching ? " · Updating…" : ""}
            </p>
          ) : null}
        </div>
      )}

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit student</DialogTitle>
            <DialogDescription>Update profile details for this student.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-student-name">Name</Label>
              <Input
                id="edit-student-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-student-phone">Phone</Label>
              <Input
                id="edit-student-phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-student-email">Email (optional)</Label>
              <Input
                id="edit-student-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete student</DialogTitle>
            <DialogDescription>
              Soft-delete {deleteTarget?.name}? They will no longer be able to sign in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => {
                void handleDelete()
              }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
