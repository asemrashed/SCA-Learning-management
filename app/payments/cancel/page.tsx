import { Suspense } from "react"
import { PaymentCancelView } from "@/features/payment/components/payment-cancel-view"

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={null}>
      <PaymentCancelView />
    </Suspense>
  )
}
