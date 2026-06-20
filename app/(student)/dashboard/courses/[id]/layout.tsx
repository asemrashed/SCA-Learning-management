"use client"

import { use } from "react"
import { usePathname } from "next/navigation"
import { useGetEnrollmentQuery } from "@/features/enrollment/api"
import { CoursePaymentGateModal } from "@/features/enrollment/components/course-payment-gate-modal"

interface CourseEnrollmentLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default function CourseEnrollmentLayout({
  children,
  params,
}: CourseEnrollmentLayoutProps) {
  const { id: enrollmentId } = use(params)
  const pathname = usePathname()
  const isPaymentHistory = pathname.endsWith("/payment-history")
  const { data } = useGetEnrollmentQuery(enrollmentId)

  const showPaymentGate = Boolean(
    data?.data?.isAccessBlocked && !isPaymentHistory,
  )

  return (
    <>
      {children}
      <CoursePaymentGateModal enrollmentId={enrollmentId} open={showPaymentGate} />
    </>
  )
}
