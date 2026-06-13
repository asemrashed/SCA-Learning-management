"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGetPaymentQuery } from "@/features/payment/api"
import { PaymentResultShell } from "@/features/payment/components/payment-result-shell"
import { formatBdtMinor } from "@/lib/format-currency"

export function PaymentFailView() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("paymentId")
  const { data } = useGetPaymentQuery(paymentId ?? "", { skip: !paymentId })
  const payment = data?.data

  return (
    <PaymentResultShell
      title="Payment failed"
      description="Your payment could not be completed. No charge was confirmed. You can try again from the course or batch page."
    >
      <div className="flex items-center gap-2 text-destructive">
        <XCircle className="h-5 w-5" />
        <span className="font-medium">Transaction declined or failed</span>
      </div>
      {payment ? (
        <p className="text-sm text-muted-foreground">
          Amount: {formatBdtMinor(payment.amountMinor)}
        </p>
      ) : null}
      <Button asChild variant="outline" className="w-full">
        <Link href="/dashboard">View my enrollments</Link>
      </Button>
      <Button asChild className="w-full">
        <Link href="/courses">Browse courses</Link>
      </Button>
    </PaymentResultShell>
  )
}
