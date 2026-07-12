import { AdminPaymentsPanel } from "@/features/monthly-payment/components/admin-payments-panel"

export default function AdminPaymentsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Payment history</h1>
        <p className="text-sm text-muted-foreground">
          Review student payments, add or edit fee records, approve requests, and manage access for
          unpaid students.
        </p>
      </div>
      <AdminPaymentsPanel />
    </div>
  )
}
