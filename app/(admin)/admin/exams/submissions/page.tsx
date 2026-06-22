import { SubmissionsPanel } from "@/features/resource-submission/components/submissions-panel"
import { ResourceCategory } from "@/types/api"

export default function AdminExamSubmissionsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Exam Submissions</h1>
        <p className="text-muted-foreground">
          Review student exam submissions and accept or reject them.
        </p>
      </div>
      <SubmissionsPanel
        category={ResourceCategory.EXAM}
        title="Exam"
      />
    </div>
  )
}
