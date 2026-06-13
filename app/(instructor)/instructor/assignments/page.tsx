import { AssignmentManagePanel } from "@/features/assessment/components/assignment-manage-panel"

export default function InstructorAssignmentsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Assignments</h1>
        <p className="text-muted-foreground">
          Create assignments for your batches and courses.
        </p>
      </div>
      <AssignmentManagePanel />
    </div>
  )
}
