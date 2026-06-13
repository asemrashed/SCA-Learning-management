"use client"

import { use } from "react"
import { EnrollmentPlayer } from "@/features/enrollment/components/enrollment-player"

export default function BatchPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <div className="p-6 md:p-8">
      <EnrollmentPlayer enrollmentId={id} />
    </div>
  )
}
