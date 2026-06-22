"use client"

import { useMemo, useState } from "react"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SecurePdfViewer } from "@/components/secure-pdf-viewer"
import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import { enrollmentProductTitle, getEnrollmentSubjects } from "@/features/enrollment/curriculum"
import { useListStudentAssessmentResultsQuery } from "@/features/resource-submission/api"
import {
  StudentResourceFilters,
  type StudentResourceFilterValues,
} from "@/features/resource/components/student-resource-filters"
import { StudentPageShell } from "@/components/student/student-page-shell"
import { ResourceCategory } from "@/types/api"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function categoryLabel(category: ResourceCategory): string {
  return category === ResourceCategory.EXAM ? "Exam" : "Assignment"
}

export function StudentAssessmentResults({ enrollmentId }: { enrollmentId: string }) {
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [filters, setFilters] = useState<StudentResourceFilterValues>({
    subjectId: "",
    moduleId: "",
  })
  const { data: enrollmentData, isLoading: enrollmentLoading } = useGetEnrollmentQuery(enrollmentId)
  const { data, isLoading, error } = useListStudentAssessmentResultsQuery(enrollmentId)

  const enrollment = enrollmentData?.data
  const results = useMemo(() => {
    const all = data?.data ?? []
    if (!enrollment || !filters.subjectId) return all
    const subjectTitle =
      getEnrollmentSubjects(enrollment).find((s) => s.id === filters.subjectId)?.title ?? null
    if (!subjectTitle) return all
    return all.filter((item) => item.subjectTitle === subjectTitle)
  }, [data?.data, enrollment, filters.subjectId])
  const courseTitle = enrollment ? enrollmentProductTitle(enrollment) : "Results"

  if (enrollmentLoading || isLoading) {
    return (
      <StudentPageShell title="Results">
        <p className="text-muted-foreground">Loading…</p>
      </StudentPageShell>
    )
  }

  if (!enrollment) {
    return (
      <StudentPageShell title="Results">
        <p className="text-destructive">Course not found.</p>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell title={courseTitle}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Results</h1>
      </div>

      {enrollment ? (
        <StudentResourceFilters
          enrollment={enrollment}
          values={filters}
          onChange={setFilters}
        />
      ) : null}

      {error ? (
        <p className="text-sm text-destructive">Could not load results.</p>
      ) : results.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No published results yet. Results appear here after your admin uploads them.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.resourceTitle}</TableCell>
                  <TableCell>{categoryLabel(item.resourceCategory)}</TableCell>
                  <TableCell>{item.subjectTitle ?? "—"}</TableCell>
                  <TableCell>{formatDate(item.resultPublishedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setPreviewId(item.id)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View result
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={Boolean(previewId)} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent showCloseButton={false} className="max-h-[95vh] max-w-5xl gap-0 overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Result</DialogTitle>
          </DialogHeader>
          {previewId ? (
            <SecurePdfViewer
              submissionId={previewId}
              title="Result"
              onClose={() => setPreviewId(null)}
              className="min-h-[80vh] rounded-none border-0"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </StudentPageShell>
  )
}
