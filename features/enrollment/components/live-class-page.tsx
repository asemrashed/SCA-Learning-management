"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import { enrollmentProductId, enrollmentProductTitle } from "@/features/enrollment/curriculum"
import { ViewLessonsButton } from "@/features/enrollment/components/view-lessons-button"
import {
  useListBatchSessionsQuery,
  useListCourseSessionsQuery,
} from "@/features/liveclass/api"
import { StudentPageShell } from "@/components/student/student-page-shell"
import { EnrollmentKind } from "@/types/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatScheduled(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function LiveClassPage({ enrollmentId }: { enrollmentId: string }) {
  const { data, isLoading, error } = useGetEnrollmentQuery(enrollmentId)
  const enrollment = data?.data
  const productId = enrollment ? enrollmentProductId(enrollment) : ""
  const kind = enrollment?.kind ?? EnrollmentKind.BATCH

  const batchQuery = useListBatchSessionsQuery(productId, {
    skip: !enrollment || kind !== EnrollmentKind.BATCH,
  })
  const courseQuery = useListCourseSessionsQuery(productId, {
    skip: !enrollment || kind !== EnrollmentKind.COURSE,
  })

  const sessionsQuery = kind === EnrollmentKind.BATCH ? batchQuery : courseQuery
  const sessions = useMemo(
    () =>
      [...(sessionsQuery.data?.data ?? [])].sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      ),
    [sessionsQuery.data],
  )

  const courseTitle = enrollment ? enrollmentProductTitle(enrollment) : "Course"

  if (isLoading || sessionsQuery.isLoading) {
    return (
      <StudentPageShell title="Live Class Link">
        <p className="text-muted-foreground">Loading…</p>
      </StudentPageShell>
    )
  }

  if (error || !enrollment) {
    return (
      <StudentPageShell title="Live Class Link">
        <p className="text-destructive">Course not found.</p>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell title={courseTitle}>
      <h1 className="mb-6 text-2xl font-bold">Live Class Link</h1>

      {sessions.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No live classes scheduled yet.
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
              {sessions.map((session, index) => (
                <TableRow
                  key={session.id}
                  className={index % 2 === 1 ? "bg-muted/20" : undefined}
                >
                  <TableCell>
                    <p className="font-medium">{session.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatScheduled(session.scheduledAt)}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <ViewLessonsButton
                      href={`/dashboard/courses/${enrollmentId}/live-class/${session.id}`}
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
