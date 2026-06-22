import { AdminPaymentsPanel } from "@/features/monthly-payment/components/admin-payments-panel"

export default function AdminPaymentsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Monthly payments</h1>
        <p className="text-sm text-muted-foreground">
          Review student payment requests, set the amount received, approve or deny each request, and
          track students who have not paid for the current month.
        </p>
      </div>
      <AdminPaymentsPanel />
    </div>
  )
}
