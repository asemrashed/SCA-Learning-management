"use client"

import { EnrollmentList } from "@/features/enrollment/components/enrollment-list"
import { EnrollmentKind } from "@/types/api"

export default function MyBatchesPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">My Batches</h1>
        <p className="text-muted-foreground">Continue your cohort batch programs</p>
      </div>
      <EnrollmentList kind={EnrollmentKind.BATCH} />
    </div>
  )
}
