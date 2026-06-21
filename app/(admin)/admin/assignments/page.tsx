import { AssessmentHub } from "@/features/resource-submission/components/assessment-hub"

export default function AdminAssignmentsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Assignments</h1>
        <p className="text-muted-foreground">
          Manage assignment PDFs, review student submissions, and publish result PDFs.
        </p>
      </div>
      <AssessmentHub variant="assignment" />
    </div>
  )
}
