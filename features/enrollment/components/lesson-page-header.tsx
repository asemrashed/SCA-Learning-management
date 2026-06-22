interface LessonPageHeaderProps {
  sectionLabel: string
  subjectTitle: string | null
  chapterTitle: string
}

export function LessonPageHeader({
  sectionLabel,
  subjectTitle,
  chapterTitle,
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
    </div>
  )
}
