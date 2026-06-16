"use client"

import { use } from "react"
import { CoursePaymentHistory } from "@/features/enrollment/components/course-payment-history"

export default function PaymentHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <CoursePaymentHistory enrollmentId={id} />
}
