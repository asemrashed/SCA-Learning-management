import { ResultsPanel } from "@/features/resource-submission/components/results-panel"
import { ResourceCategory } from "@/types/api"

export default function AdminAssignmentResultsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Assignment Results</h1>
        <p className="text-muted-foreground">
          Upload result PDFs for accepted assignment submissions.
        </p>
      </div>
      <ResultsPanel
        category={ResourceCategory.ASSIGNMENT}
        backHref="/admin/assignments"
        title="Assignment"
      />
    </div>
  )
}
