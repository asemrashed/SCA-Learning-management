"use client"

import { EnrollmentList } from "@/features/enrollment/components/enrollment-list"
import { EnrollmentKind } from "@/types/api"
import { LIVE_COURSE, MY_LIVE_COURSES } from "@/lib/product-vocabulary"

export default function MyLiveCoursesPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{MY_LIVE_COURSES}</h1>
        <p className="text-muted-foreground">Continue your enrolled {LIVE_COURSE.toLowerCase()} programs</p>
      </div>
      <EnrollmentList kind={EnrollmentKind.BATCH} />
    </div>
  )
}
