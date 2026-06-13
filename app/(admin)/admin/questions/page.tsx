"use client"

import { QuestionBankPanel } from "@/features/assessment/components/question-bank"

export default function AdminQuestionsPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Question bank</h1>
      <QuestionBankPanel />
    </div>
  )
}
