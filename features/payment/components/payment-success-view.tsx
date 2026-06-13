"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useListEnrollmentsQuery } from "@/features/enrollment/api"
import { enrollmentPlayerPath } from "@/features/enrollment/utils"
import { useGetPaymentQuery } from "@/features/payment/api"
import { PaymentResultShell } from "@/features/payment/components/payment-result-shell"
import { EnrollmentStatus, PaymentStatus } from "@/types/api"

export function PaymentSuccessView() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("paymentId")

  const {
    data: paymentData,
    refetch: refetchPayment,
    isLoading: paymentLoading,
  } = useGetPaymentQuery(paymentId ?? "", { skip: !paymentId, pollingInterval: 3000 })

  const {
    data: enrollmentsData,
    refetch: refetchEnrollments,
    isLoading: enrollmentsLoading,
  } = useListEnrollmentsQuery(undefined, { pollingInterval: 3000 })

  const payment = paymentData?.data
  const enrollment = useMemo(() => {
    if (!payment?.enrollmentId) return null
    return enrollmentsData?.data.find((item) => item.id === payment.enrollmentId) ?? null
  }, [enrollmentsData, payment?.enrollmentId])

  const isConfirmed =
    payment?.status === PaymentStatus.PAID ||
    enrollment?.status === EnrollmentStatus.ACTIVE ||
    enrollment?.status === EnrollmentStatus.COMPLETED

  useEffect(() => {
    if (!paymentId) return
    void refetchPayment()
    void refetchEnrollments()
  }, [paymentId, refetchPayment, refetchEnrollments])

  if (!paymentId) {
    return (
      <PaymentResultShell
        title="Invalid payment link"
        description="No payment reference was provided. If you completed checkout, check your dashboard enrollments."
      />
    )
  }

  if (paymentLoading || enrollmentsLoading) {
    return (
      <PaymentResultShell
        title="Checking payment"
        description="Please wait while we confirm your payment with the gateway."
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </PaymentResultShell>
    )
  }

  if (isConfirmed && enrollment) {
    return (
      <PaymentResultShell
        title="Payment successful"
        description="You are enrolled and can start learning right away."
      >
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Enrollment active</span>
        </div>
        <Button asChild className="w-full">
          <Link href={enrollmentPlayerPath(enrollment.kind, enrollment.id)}>Go to course</Link>
        </Button>
      </PaymentResultShell>
    )
  }

  return (
    <PaymentResultShell
      title="Payment received"
      description="Your payment is being confirmed. This usually takes a few seconds. This page will update automatically."
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        If this takes longer than a minute, return to your dashboard and refresh enrollments.
      </p>
    </PaymentResultShell>
  )
}
