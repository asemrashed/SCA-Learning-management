"use client"

import Link from "next/link"
import { ClipboardList, FileCheck, Inbox } from "lucide-react"
import { SectionLinkCard } from "@/components/student/section-link-card"

interface AssessmentHubProps {
  variant: "exam" | "assignment"
}

export function AssessmentHub({ variant }: AssessmentHubProps) {
  const base = variant === "exam" ? "/admin/exams" : "/admin/assignments"
  const singular = variant === "exam" ? "Exam" : "Assignment"
  const plural = variant === "exam" ? "Exams" : "Assignments"

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SectionLinkCard
        href={`${base}/all`}
        title={`All ${plural}`}
        icon={ClipboardList}
        className="bg-sky-50"
        iconClassName="bg-sky-100"
        delay={0}
      />
      <SectionLinkCard
        href={`${base}/submissions`}
        title="View Submission"
        icon={Inbox}
        className="bg-violet-50"
        iconClassName="bg-violet-100"
        delay={0.05}
      />
      <SectionLinkCard
        href={`${base}/results`}
        title="Result"
        icon={FileCheck}
        className="bg-emerald-50"
        iconClassName="bg-emerald-100"
        delay={0.1}
      />
      <p className="text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
        Manage {singular.toLowerCase()} PDFs, review student submissions, and upload result PDFs.
        Students submit via WhatsApp after clicking Submit in their course.
      </p>
      <Link href={base} className="sr-only">
        {plural}
      </Link>
    </div>
  )
}
