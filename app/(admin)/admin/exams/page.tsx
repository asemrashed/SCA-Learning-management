import { ExamManagePanel } from "@/features/assessment/components/exam-manage-panel"
import { LIVE_COURSE } from "@/lib/product-vocabulary"

export default function AdminExamsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Exams</h1>
        <p className="text-muted-foreground">
          Create exams from the question bank and attach them to a {LIVE_COURSE.toLowerCase()}.
        </p>
      </div>
      <ExamManagePanel />
    </div>
  )
}
