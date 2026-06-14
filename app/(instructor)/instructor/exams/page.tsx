import { ExamManagePanel } from "@/features/assessment/components/exam-manage-panel"
import { LIVE_COURSES } from "@/lib/product-vocabulary"

export default function InstructorExamsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Exams</h1>
        <p className="text-muted-foreground">
          Create exams from the question bank for your {LIVE_COURSES.toLowerCase()}.
        </p>
      </div>
      <ExamManagePanel />
    </div>
  )
}
