import { ResourceManagePanel } from "@/features/resource/components/resource-manage-panel"

export default function AdminResourcesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Resources</h1>
        <p className="text-sm text-muted-foreground">
          Upload lecture sheets, solution PDFs, notices, and result sheets. Use the separate Exams,
          Assignments, and Question bank pages for assessment PDFs.
        </p>
      </div>
      <ResourceManagePanel />
    </div>
  )
}
