"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  BROWSE_COURSES,
  COURSE,
  COURSE_CATALOG_HREF,
  deliveryModeLabel,
  LIVE_BATCH_CATALOG_HREF,
} from "@/lib/product-vocabulary"
import { DeliveryMode, EnrollmentKind, EnrollmentStatus } from "@/types/api"
import { StudentPageShell } from "@/components/student/student-page-shell"

export function StudentCoursesTable() {
  const { data, isLoading, error } = useListEnrollmentsQuery()

  const items = (data?.data ?? []).filter(
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
            You are not enrolled in any {COURSE.toLowerCase()}s yet.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline">
              <Link href={LIVE_BATCH_CATALOG_HREF}>Browse live batches</Link>
            </Button>
            <Button asChild>
              <Link href={COURSE_CATALOG_HREF}>{BROWSE_COURSES}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const courseName =
                    item.kind === EnrollmentKind.BATCH
                      ? item.batch!.course.title
                      : item.course!.title
                  const enrollmentLabel =
                    item.kind === EnrollmentKind.BATCH
                      ? `${item.batch!.title}${item.rollNumber ? ` · ${item.rollNumber}` : ""}`
                      : deliveryModeLabel(DeliveryMode.RECORDED)

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-md whitespace-normal">
                        <div className="font-medium">{courseName}</div>
                        <Badge variant="outline" className="mt-1">
                          {deliveryModeLabel(item.deliveryMode)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md whitespace-normal text-muted-foreground">
                        {enrollmentLabel}
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
                item.kind === EnrollmentKind.BATCH
                  ? item.batch!.course.title
                  : item.course!.title
              const enrollmentLabel =
                item.kind === EnrollmentKind.BATCH
                  ? `${item.batch!.title}${item.rollNumber ? ` · ${item.rollNumber}` : ""}`
                  : deliveryModeLabel(DeliveryMode.RECORDED)

              return (
                <div key={item.id} className="rounded-xl border p-4">
                  <p className="mb-1 font-semibold">{courseName}</p>
                  <p className="mb-2 text-sm text-muted-foreground">{enrollmentLabel}</p>
                  <Badge variant="outline" className="mb-4">
                    {deliveryModeLabel(item.deliveryMode)}
                  </Badge>
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
