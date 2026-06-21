import { AssessmentHub } from "@/features/resource-submission/components/assessment-hub"

export default function AdminExamsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Exams</h1>
        <p className="text-muted-foreground">
          Manage exam PDFs, review student submissions, and publish result PDFs.
        </p>
      </div>
      <AssessmentHub variant="exam" />
    </div>
  )
}
