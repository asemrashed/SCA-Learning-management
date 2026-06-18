"use client"

import { useMemo } from "react"
import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import { enrollmentProductId, enrollmentProductTitle } from "@/features/enrollment/curriculum"
import { LiveClassJoinDialog } from "@/features/liveclass/components/live-class-join-dialog"
import {
  useListBatchLiveClassSchedulesQuery,
  useListCourseLiveClassSchedulesQuery,
} from "@/features/liveclass/api"
import {
  formatScheduleDay,
  formatTimeRange,
  sortLiveClasses,
} from "@/features/liveclass/lib/schedule-format"
import { StudentPageShell } from "@/components/student/student-page-shell"
import { EnrollmentKind, LiveClassType } from "@/types/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function LiveClassPage({ enrollmentId }: { enrollmentId: string }) {
  const { data, isLoading, error } = useGetEnrollmentQuery(enrollmentId)
  const enrollment = data?.data
  const productId = enrollment ? enrollmentProductId(enrollment) : ""
  const kind = enrollment?.kind ?? EnrollmentKind.BATCH
  const batchId = enrollment?.batch?.id ?? (kind === EnrollmentKind.BATCH ? productId : null)

  const batchQuery = useListBatchLiveClassSchedulesQuery(batchId ?? "", {
    skip: !batchId,
  })
  const courseQuery = useListCourseLiveClassSchedulesQuery(productId, {
    skip: Boolean(batchId) || !enrollment,
  })

  const schedulesQuery = batchId ? batchQuery : courseQuery
  const schedules = useMemo(
    () => sortLiveClasses(schedulesQuery.data?.data ?? []),
    [schedulesQuery.data],
  )

  const recurring = schedules.filter((s) => s.type === LiveClassType.RECURRING)
  const oneTime = schedules.filter((s) => s.type === LiveClassType.ONE_TIME)

  const courseTitle = enrollment ? enrollmentProductTitle(enrollment) : "Course"

  if (isLoading || schedulesQuery.isLoading) {
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

  function renderTable(rows: typeof schedules) {
    if (rows.length === 0) return null

    return (
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              <TableHead className="font-semibold">Subject</TableHead>
              <TableHead className="font-semibold">Day</TableHead>
              <TableHead className="font-semibold">Time</TableHead>
              <TableHead className="font-semibold">Passcode</TableHead>
              <TableHead className="w-40 text-right font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((schedule, index) => (
              <TableRow
                key={schedule.id}
                className={index % 2 === 1 ? "bg-muted/20" : undefined}
              >
                <TableCell className="font-medium">{schedule.subject}</TableCell>
                <TableCell>{formatScheduleDay(schedule)}</TableCell>
                <TableCell>{formatTimeRange(schedule.startTime, schedule.endTime)}</TableCell>
                <TableCell className="font-mono text-sm">
                  {schedule.passcode ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <LiveClassJoinDialog schedule={schedule} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <StudentPageShell title={courseTitle}>
      <h1 className="mb-6 text-2xl font-bold">Live Class Link</h1>

      {schedules.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No live classes scheduled yet.
        </p>
      ) : (
        <div className="space-y-8">
          {recurring.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Weekly classes</h2>
              {renderTable(recurring)}
            </section>
          ) : null}
          {oneTime.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">One-time sessions</h2>
              {renderTable(oneTime)}
            </section>
          ) : null}
        </div>
      )}
    </StudentPageShell>
  )
}
