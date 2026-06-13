import { ResourceManagePanel } from "@/features/resource/components/resource-manage-panel"

export default function InstructorResourcesPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Resources</h1>
        <p className="text-muted-foreground">
          Add materials to your batches and courses.
        </p>
      </div>
      <ResourceManagePanel />
    </div>
  )
}
