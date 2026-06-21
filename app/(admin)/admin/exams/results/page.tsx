import { ResultsPanel } from "@/features/resource-submission/components/results-panel"
import { ResourceCategory } from "@/types/api"

export default function AdminExamResultsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Exam Results</h1>
        <p className="text-muted-foreground">
          Upload result PDFs for accepted exam submissions.
        </p>
      </div>
      <ResultsPanel
        category={ResourceCategory.EXAM}
        backHref="/admin/exams"
        title="Exam"
      />
    </div>
  )
}
