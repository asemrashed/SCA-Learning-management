"use client"

import { useMemo, useState } from "react"
import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import {
  enrollmentProductTitle,
  getEnrollmentSubjects,
  getModulesForSubject,
} from "@/features/enrollment/curriculum"
import { ViewLessonsButton } from "@/features/enrollment/components/view-lessons-button"
import { StudentPageShell } from "@/components/student/student-page-shell"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SubjectChapterPageProps {
  enrollmentId: string
  pageTitle: string
  lessonBasePath: "pre-recorded" | "recorded"
}

export function SubjectChapterPage({
  enrollmentId,
  pageTitle,
  lessonBasePath,
}: SubjectChapterPageProps) {
  const { data, isLoading, error } = useGetEnrollmentQuery(enrollmentId)
  const enrollment = data?.data

  const subjects = useMemo(
    () => (enrollment ? getEnrollmentSubjects(enrollment) : []),
    [enrollment],
  )

  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null)
  const selectedSubjectId = activeSubjectId ?? subjects[0]?.id ?? null

  const modules = useMemo(() => {
    if (!enrollment || !selectedSubjectId) return []
    return getModulesForSubject(enrollment, selectedSubjectId)
  }, [enrollment, selectedSubjectId])

  const courseTitle = enrollment ? enrollmentProductTitle(enrollment) : "Course"

  if (isLoading) {
    return (
      <StudentPageShell title={pageTitle}>
        <p className="text-muted-foreground">Loading…</p>
      </StudentPageShell>
    )
  }

  if (error || !enrollment) {
    return (
      <StudentPageShell title={pageTitle}>
        <p className="text-destructive">Course not found.</p>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell title={courseTitle}>
      <h1 className="mb-6 text-2xl font-bold">{pageTitle}</h1>

      {subjects.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {subjects.map((subject) => {
            const isActive = subject.id === selectedSubjectId
            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => setActiveSubjectId(subject.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40",
                )}
              >
                {subject.title}
              </button>
            )
          })}
        </div>
      ) : null}

      {modules.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No chapters available yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="w-40 text-right font-semibold">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((mod, index) => (
                <TableRow key={mod.id} className={index % 2 === 1 ? "bg-muted/20" : undefined}>
                  <TableCell className="font-medium">{mod.title}</TableCell>
                  <TableCell className="text-right">
                    <ViewLessonsButton
                      href={`/dashboard/courses/${enrollmentId}/${lessonBasePath}/${mod.id}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </StudentPageShell>
  )
}
