import { AdminPaymentsPanel } from "@/features/monthly-payment/components/admin-payments-panel"

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Monthly payments</h1>
        <p className="mt-2 text-muted-foreground">
          Review student payment requests, set the amount received, and approve or deny each request.
        </p>
      </div>
      <AdminPaymentsPanel />
    </div>
  )
}
