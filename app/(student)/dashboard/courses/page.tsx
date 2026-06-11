"use client"

import { EnrollmentList } from "@/features/enrollment/components/enrollment-list"

export default function MyCoursesPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">My Courses</h1>
        <p className="text-muted-foreground">Manage and continue your enrolled courses</p>
      </div>
      <EnrollmentList />
    </div>
  )
}
