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
  Lightbulb,
} from "lucide-react"
import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import { SectionLinkCard } from "@/components/student/section-link-card"
import { StudentPageShell } from "@/components/student/student-page-shell"
import { EnrollmentKind } from "@/types/api"

interface CourseHubProps {
  enrollmentId: string
}

const sections = [
  { slug: "live-class", title: "Live Class", icon: Radio },
  { slug: "recorded", title: "Record Class", icon: PlayCircle },
  { slug: "pre-recorded", title: "Pre-Recorded Class", icon: Video },
  { slug: "lecture-sheet", title: "Lecture Sheet", icon: FileText },
  { slug: "solution-pdf", title: "Solution PDF", icon: FileCheck },
  { slug: "suggestion", title: "Suggestion", icon: Lightbulb },
  { slug: "assignment", title: "Assignment", icon: PenLine },
  { slug: "exam", title: "Exam", icon: ClipboardList },
  { slug: "result-sheet", title: "Result Sheet", icon: Award },
  { slug: "notice", title: "Notice", icon: Bell },
  { slug: "payment-history", title: "Payment History", icon: CreditCard },
  { slug: "details", title: "Course Details", icon: BookOpen },
] as const

const RECORDED_COURSE_SECTION_SLUGS = new Set([
  "recorded",
  "lecture-sheet",
  "solution-pdf",
  "suggestion",
  "details",
])

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

  const visibleSections =
    enrollment.kind === EnrollmentKind.COURSE
      ? sections.filter((section) => RECORDED_COURSE_SECTION_SLUGS.has(section.slug))
      : sections

  return (
    <StudentPageShell title={title ?? "Course"}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleSections.map((section, index) => (
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
