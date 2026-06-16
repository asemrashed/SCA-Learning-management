"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useListEnrollmentsQuery } from "@/features/enrollment/api"
import { enrollmentHubPath } from "@/features/enrollment/utils"
import {
  BROWSE_LIVE_COURSES,
  LIVE_COURSE,
  LIVE_COURSE_CATALOG_HREF,
  SHOW_RECORDED_COURSES,
} from "@/lib/product-vocabulary"
import { EnrollmentKind, EnrollmentStatus } from "@/types/api"
import { StudentPageShell } from "@/components/student/student-page-shell"

export function StudentCoursesTable() {
  const { data, isLoading, error } = useListEnrollmentsQuery()

  const items = (data?.data ?? [])
    .filter((item) => SHOW_RECORDED_COURSES || item.kind === EnrollmentKind.BATCH)
    .filter(
      (item) =>
        item.status === EnrollmentStatus.ACTIVE ||
        item.status === EnrollmentStatus.COMPLETED ||
        item.status === EnrollmentStatus.PENDING,
    )

  return (
    <StudentPageShell title="My Courses">
      {isLoading ? (
        <p className="text-muted-foreground">Loading courses…</p>
      ) : error ? (
        <p className="text-destructive">Could not load your courses.</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="mb-4 text-muted-foreground">
            You are not enrolled in any {LIVE_COURSE.toLowerCase()}s yet.
          </p>
          <Button asChild>
            <Link href={LIVE_COURSE_CATALOG_HREF}>{BROWSE_LIVE_COURSES}</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const courseName =
                    item.kind === EnrollmentKind.BATCH
                      ? item.batch!.title
                      : item.course!.title
                  const batchName =
                    item.kind === EnrollmentKind.BATCH
                      ? `Batch ${item.rollNumber ?? "—"} - ${item.batch!.title}`
                      : item.course!.title

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-md whitespace-normal font-medium">
                        {courseName}
                      </TableCell>
                      <TableCell className="max-w-md whitespace-normal text-muted-foreground">
                        {batchName}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          size="sm"
                          className="rounded-lg bg-primary text-secondary hover:bg-primary/90"
                        >
                          <Link href={enrollmentHubPath(item.kind, item.id)}>
                            Details
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-4 md:hidden">
            {items.map((item) => {
              const courseName =
                item.kind === EnrollmentKind.BATCH ? item.batch!.title : item.course!.title
              const batchName =
                item.kind === EnrollmentKind.BATCH
                  ? `Batch ${item.rollNumber ?? "—"} - ${item.batch!.title}`
                  : item.course!.title

              return (
                <div key={item.id} className="rounded-xl border p-4">
                  <p className="mb-1 font-semibold">{courseName}</p>
                  <p className="mb-4 text-sm text-muted-foreground">{batchName}</p>
                  <Button
                    asChild
                    size="sm"
                    className="w-full rounded-lg bg-primary text-secondary hover:bg-primary/90"
                  >
                    <Link href={enrollmentHubPath(item.kind, item.id)}>
                      Details
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </StudentPageShell>
  )
}
