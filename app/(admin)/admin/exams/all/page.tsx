import { ExamManagePanel } from "@/features/resource/components/exam-manage-panel"

export default function AdminExamsAllPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">All Exams</h1>
        <p className="text-muted-foreground">
          Create PDF exams or assemble them from the question bank.
        </p>
      </div>
      <ExamManagePanel />
    </div>
  )
}
