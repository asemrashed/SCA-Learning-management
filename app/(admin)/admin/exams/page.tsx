"use client"

import { ResourceManagePanel } from "@/features/resource/components/resource-manage-panel"
import { ExamManagePanel } from "@/features/assessment/components/exam-manage-panel"
import { ResourceCategory } from "@/types/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminExamsPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Exams</h1>
      <Tabs defaultValue="interactive">
        <TabsList className="mb-6">
          <TabsTrigger value="interactive">Interactive exams</TabsTrigger>
          <TabsTrigger value="pdf">Exam PDFs</TabsTrigger>
        </TabsList>
        <TabsContent value="interactive" className="mt-0">
          <ExamManagePanel />
        </TabsContent>
        <TabsContent value="pdf" className="mt-0">
          <ResourceManagePanel
            title="Exam PDFs"
            description="Upload exam PDFs. Students view them in the secure in-app viewer."
            defaultCategory={ResourceCategory.EXAM}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
