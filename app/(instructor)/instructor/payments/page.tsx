import { InstructorPaymentsPanel } from "@/features/monthly-payment/components/instructor-payments-panel"

export default function InstructorPaymentsPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Payment history</h1>
        <p className="mt-2 text-muted-foreground">
          View approved monthly payments for students in your batches. Filter by course, batch, or search by name and roll.
        </p>
      </div>
      <InstructorPaymentsPanel />
    </div>
  )
}
