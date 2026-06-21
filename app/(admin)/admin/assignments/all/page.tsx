import { AssignmentManagePanel } from "@/features/resource/components/assignment-manage-panel"

export default function AdminAssignmentsAllPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">All Assignments</h1>
        <p className="text-muted-foreground">
          Upload assignment PDFs with start time and deadline. Students submit via WhatsApp.
        </p>
      </div>
      <AssignmentManagePanel />
    </div>
  )
}
