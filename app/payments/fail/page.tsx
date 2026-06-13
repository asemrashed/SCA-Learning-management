import { Suspense } from "react"
import { PaymentFailView } from "@/features/payment/components/payment-fail-view"

export default function PaymentFailPage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailView />
    </Suspense>
  )
}
