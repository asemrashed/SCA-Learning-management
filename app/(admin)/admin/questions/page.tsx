import { QuestionBankPanel } from "@/features/resource/components/question-bank-panel"

export default function AdminQuestionsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Question bank</h1>
        <p className="text-muted-foreground">
          Store PDF questions with marks. Filter by course, batch, subject, and date. Use them when
          creating exams.
        </p>
      </div>
      <QuestionBankPanel />
    </div>
  )
}
