"use client"

import {
  BookOpen,
  FileText,
  FileCheck,
  Radio,
  Video,
  PlayCircle,
  CreditCard,
  ClipboardList,
  PenLine,
  Bell,
  Award,
} from "lucide-react"
import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import { SectionLinkCard } from "@/components/student/section-link-card"
import { StudentPageShell } from "@/components/student/student-page-shell"
import { EnrollmentKind } from "@/types/api"

interface CourseHubProps {
  enrollmentId: string
}

const sections = [
  { slug: "details", title: "Course Details", icon: BookOpen },
  { slug: "lecture-sheet", title: "Lecture Sheet", icon: FileText },
  { slug: "solution-pdf", title: "Solution PDF", icon: FileCheck },
  { slug: "notice", title: "Notice", icon: Bell },
  { slug: "result-sheet", title: "Result Sheet", icon: Award },
  { slug: "live-class", title: "Live Class Link", icon: Radio },
  { slug: "pre-recorded", title: "Pre-Recorded Class", icon: Video },
  { slug: "recorded", title: "Recorded Class", icon: PlayCircle },
  { slug: "payment-history", title: "Payment History", icon: CreditCard },
  { slug: "exam", title: "Exam", icon: ClipboardList },
  { slug: "assignment", title: "Assignment", icon: PenLine },
] as const

export function CourseHub({ enrollmentId }: CourseHubProps) {
  const { data, isLoading, error } = useGetEnrollmentQuery(enrollmentId)
  const enrollment = data?.data

  const title =
    enrollment?.kind === EnrollmentKind.BATCH
      ? enrollment.batch?.title
      : enrollment?.course?.title

  if (isLoading) {
    return (
      <StudentPageShell title="Course">
        <p className="text-muted-foreground">Loading course…</p>
      </StudentPageShell>
    )
  }

  if (error || !enrollment) {
    return (
      <StudentPageShell title="Course">
        <p className="text-destructive">Course not found.</p>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell title={title ?? "Course"}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section, index) => (
          <SectionLinkCard
            key={section.slug}
            href={`/dashboard/courses/${enrollmentId}/${section.slug}`}
            title={section.title}
            icon={section.icon}
            delay={index * 0.05}
          />
        ))}
      </div>
    </StudentPageShell>
  )
}
