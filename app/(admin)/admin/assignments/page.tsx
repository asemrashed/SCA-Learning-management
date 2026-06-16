import { ResourceManagePanel } from "@/features/resource/components/resource-manage-panel"
import { ResourceCategory } from "@/types/api"

export default function AdminAssignmentsPage() {
  return (
    <div className="p-6 md:p-8">
      <ResourceManagePanel
        title="Assignments"
        description="Upload assignment PDFs. Students view them in the secure in-app viewer."
        defaultCategory={ResourceCategory.ASSIGNMENT}
      />
    </div>
  )
}
