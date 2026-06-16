import { ResourceManagePanel } from "@/features/resource/components/resource-manage-panel"
import { ResourceCategory } from "@/types/api"

export default function InstructorAssignmentsPage() {
  return (
    <div className="p-6 md:p-8">
      <ResourceManagePanel
        title="Assignments"
        description="Upload assignment PDFs for your courses."
        defaultCategory={ResourceCategory.ASSIGNMENT}
      />
    </div>
  )
}
