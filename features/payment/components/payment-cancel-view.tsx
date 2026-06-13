"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGetPaymentQuery } from "@/features/payment/api"
import { PaymentResultShell } from "@/features/payment/components/payment-result-shell"
import { formatBdtMinor } from "@/lib/format-currency"

export function PaymentCancelView() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("paymentId")
  const { data } = useGetPaymentQuery(paymentId ?? "", { skip: !paymentId })
  const payment = data?.data

  return (
    <PaymentResultShell
      title="Payment cancelled"
      description="You cancelled checkout before completing payment. Your enrollment is still pending — you can pay anytime from the course or batch page."
    >
      <div className="flex items-center gap-2 text-amber-600">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">Checkout cancelled</span>
      </div>
      {payment ? (
        <p className="text-sm text-muted-foreground">
          Amount due: {formatBdtMinor(payment.amountMinor)}
        </p>
      ) : null}
      <Button asChild variant="outline" className="w-full">
        <Link href="/dashboard">Go to dashboard</Link>
      </Button>
      <Button asChild className="w-full">
        <Link href="/batches">Browse batches</Link>
      </Button>
    </PaymentResultShell>
  )
}
