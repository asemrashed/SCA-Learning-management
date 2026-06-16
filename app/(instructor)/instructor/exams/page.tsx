import { ResourceManagePanel } from "@/features/resource/components/resource-manage-panel"
import { ResourceCategory } from "@/types/api"

export default function InstructorExamsPage() {
  return (
    <div className="p-6 md:p-8">
      <ResourceManagePanel
        title="Exams"
        description="Upload exam PDFs for your courses."
        defaultCategory={ResourceCategory.EXAM}
      />
    </div>
  )
}
