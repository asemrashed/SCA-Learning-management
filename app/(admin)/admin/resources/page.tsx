import { ResourceManagePanel } from "@/features/resource/components/resource-manage-panel"

export default function AdminResourcesPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Resources</h1>
        <p className="text-muted-foreground">
          Upload lecture sheets, solution PDFs, notices, and result sheets. Use the separate
          Exams and Assignments pages for those PDFs.
        </p>
      </div>
      <ResourceManagePanel />
    </div>
  )
}
