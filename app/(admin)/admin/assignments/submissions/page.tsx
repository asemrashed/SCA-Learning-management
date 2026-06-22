import { SubmissionsPanel } from "@/features/resource-submission/components/submissions-panel"
import { ResourceCategory } from "@/types/api"

export default function AdminAssignmentSubmissionsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Assignment Submissions</h1>
        <p className="text-muted-foreground">
          Review student assignment submissions and accept or reject them.
        </p>
      </div>
      <SubmissionsPanel
        category={ResourceCategory.ASSIGNMENT}
        title="Assignment"
      />
    </div>
  )
}
