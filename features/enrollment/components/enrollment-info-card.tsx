"use client"

import { Calendar, Hash, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatBatchDate } from "@/features/batch/utils"
import type { EnrollmentDetail } from "@/types/api"
import { EnrollmentKind, EnrollmentStatus } from "@/types/api"

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const STATUS_LABEL: Record<EnrollmentStatus, string> = {
  [EnrollmentStatus.PENDING]: "Pending approval",
  [EnrollmentStatus.ACTIVE]: "Active",
  [EnrollmentStatus.COMPLETED]: "Completed",
  [EnrollmentStatus.CANCELLED]: "Cancelled",
}

interface EnrollmentInfoCardProps {
  enrollment: EnrollmentDetail
}

export function EnrollmentInfoCard({ enrollment }: EnrollmentInfoCardProps) {
  const batchEndDate =
    enrollment.kind === EnrollmentKind.BATCH ? enrollment.batch?.endDate ?? null : null

  return (
    <section className="rounded-[20px] bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-foreground">Your enrollment</h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        {enrollment.rollNumber ? (
          <div className="flex gap-3">
            <Hash className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <dt className="text-sm text-muted-foreground">Roll number</dt>
              <dd className="font-medium text-foreground">{enrollment.rollNumber}</dd>
            </div>
          </div>
        ) : null}

        <div className="flex gap-3">
          <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <dt className="text-sm text-muted-foreground">Status</dt>
            <dd>
              <Badge variant={enrollment.status === EnrollmentStatus.ACTIVE ? "default" : "secondary"}>
                {STATUS_LABEL[enrollment.status]}
              </Badge>
            </dd>
          </div>
        </div>

        <div className="flex gap-3">
          <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <dt className="text-sm text-muted-foreground">Enrolled on</dt>
            <dd className="font-medium text-foreground">{formatDateTime(enrollment.enrolledAt)}</dd>
          </div>
        </div>

        {enrollment.completedAt ? (
          <div className="flex gap-3">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <dt className="text-sm text-muted-foreground">Completed on</dt>
              <dd className="font-medium text-foreground">
                {formatDateTime(enrollment.completedAt)}
              </dd>
            </div>
          </div>
        ) : null}

        {batchEndDate ? (
          <div className="flex gap-3">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <dt className="text-sm text-muted-foreground">Batch ends</dt>
              <dd className="font-medium text-foreground">{formatBatchDate(batchEndDate)}</dd>
            </div>
          </div>
        ) : null}

        {enrollment.kind === EnrollmentKind.BATCH && enrollment.batch ? (
          <div className="flex gap-3 sm:col-span-2">
            <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <dt className="text-sm text-muted-foreground">Batch</dt>
              <dd className="font-medium text-foreground">{enrollment.batch.title}</dd>
            </div>
          </div>
        ) : null}
      </dl>
    </section>
  )
}
