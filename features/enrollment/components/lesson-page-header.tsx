import Link from "next/link"
import { Button } from "@/components/ui/button"

interface LessonPageHeaderProps {
  sectionLabel: string
  subjectTitle: string | null
  chapterTitle: string
  backHref: string
  backLabel: string
}

export function LessonPageHeader({
  sectionLabel,
  subjectTitle,
  chapterTitle,
  backHref,
  backLabel,
}: LessonPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{sectionLabel}</p>
        {subjectTitle ? (
          <p className="mt-1 text-sm font-medium text-primary">{subjectTitle}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-bold">{chapterTitle}</h1>
      </div>
      <Button variant="outline" size="sm" asChild className="shrink-0">
        <Link href={backHref}>{backLabel}</Link>
      </Button>
    </div>
  )
}
