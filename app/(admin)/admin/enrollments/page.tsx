import { EnrollmentRequestsPanel } from "@/features/enrollment/components/enrollment-requests-panel"

export default function AdminEnrollmentsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Enrollments</h1>
        <p className="text-sm text-muted-foreground">
          View all enrollments, filter by status, and review pending requests.
        </p>
      </div>
      <EnrollmentRequestsPanel />
    </div>
  )
}
