import { AdminStudentsPanel } from "@/features/admin-student/components/admin-students-panel"

export default function SuperAdminStudentsPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Students</h1>
        <p className="mt-2 text-muted-foreground">
          Browse enrolled students, filter by course or batch, and manage accounts.
        </p>
      </div>
      <AdminStudentsPanel />
    </div>
  )
}
