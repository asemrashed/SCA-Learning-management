import { ResourceManagePanel } from "@/features/resource/components/resource-manage-panel"
import { ResourceCategory } from "@/types/api"

export default function AdminExamsPage() {
  return (
    <div className="p-6 md:p-8">
      <ResourceManagePanel
        title="Exams"
        description="Upload exam PDFs. Students view them in the secure in-app viewer."
        defaultCategory={ResourceCategory.EXAM}
      />
    </div>
  )
}
