"use client"

import { use } from "react"
import { StudentOrderDetail } from "@/features/shop/components/student-order-detail"

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <StudentOrderDetail orderId={id} />
}
