import { Suspense } from "react"
import { PaymentSuccessView } from "@/features/payment/components/payment-success-view"

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessView />
    </Suspense>
  )
}
