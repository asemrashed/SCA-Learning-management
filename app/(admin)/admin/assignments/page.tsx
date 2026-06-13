import { AssignmentManagePanel } from "@/features/assessment/components/assignment-manage-panel"

export default function AdminAssignmentsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Assignments</h1>
        <p className="text-muted-foreground">
          Create and manage assignments for batches and courses.
        </p>
      </div>
      <AssignmentManagePanel />
    </div>
  )
}
