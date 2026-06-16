"use client"

import { Construction } from "lucide-react"
import { StudentPageShell } from "@/components/student/student-page-shell"

interface CoursePlaceholderPageProps {
  title: string
}

export function CoursePlaceholderPage({ title }: CoursePlaceholderPageProps) {
  return (
    <StudentPageShell title={title}>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Construction className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="mb-2 font-medium text-foreground">Coming soon</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          This section will be available in a future update.
        </p>
      </div>
    </StudentPageShell>
  )
}
