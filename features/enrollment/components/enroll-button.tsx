"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"
import { useCreateEnrollmentMutation } from "@/features/enrollment/api"
import { EnrollmentStatus } from "@/types/api"

interface EnrollButtonProps {
  batchId?: string
  courseId?: string
  priceMinor: number
  className?: string
}

export function EnrollButton({ batchId, courseId, priceMinor, className }: EnrollButtonProps) {
  const router = useRouter()
  const accessToken = useSelector((s: RootState) => s.auth.accessToken)
  const [createEnrollment, { isLoading }] = useCreateEnrollmentMutation()
  const [error, setError] = useState<string | null>(null)

  if (!accessToken) {
    return (
      <Button className={className} size="lg" asChild>
        <Link href="/login">
          Enroll Now
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    )
  }

  async function handleEnroll() {
    setError(null)
    try {
      const result = await createEnrollment({ batchId, courseId }).unwrap()
      if (result.data.status === EnrollmentStatus.PENDING && priceMinor > 0) {
        setError("Payment required — checkout coming in a future update.")
        return
      }
      router.push(`/dashboard/courses/${result.data.id}`)
    } catch {
      setError("Could not enroll. You may already be enrolled.")
    }
  }

  return (
    <div>
      <Button className={className} size="lg" disabled={isLoading} onClick={() => void handleEnroll()}>
        {isLoading ? "Enrolling…" : "Enroll Now"}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
