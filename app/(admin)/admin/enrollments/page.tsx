import { EnrollmentRequestsPanel } from "@/features/enrollment/components/enrollment-requests-panel"

export default function AdminEnrollmentsPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Enrollment requests</h1>
        <p className="mt-2 text-muted-foreground">
          Review student requests, assign roll numbers on approval, or reject.
        </p>
      </div>
      <EnrollmentRequestsPanel />
    </div>
  )
}
