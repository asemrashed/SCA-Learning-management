"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"
import { useCreateEnrollmentMutation, useListEnrollmentsQuery } from "@/features/enrollment/api"
import { enrollmentPlayerPath } from "@/features/enrollment/utils"
import { useInitiatePaymentMutation } from "@/features/payment/api"
import {
  EnrollmentKind,
  EnrollmentStatus,
  PaymentPurpose,
} from "@/types/api"

interface EnrollButtonProps {
  batchId?: string
  courseId?: string
  priceMinor: number
  className?: string
}

function matchesProduct(
  item: { kind: EnrollmentKind; batch: { id: string } | null; course: { id: string } | null },
  batchId?: string,
  courseId?: string,
): boolean {
  if (batchId) {
    return item.kind === EnrollmentKind.BATCH && item.batch?.id === batchId
  }
  if (courseId) {
    return item.kind === EnrollmentKind.COURSE && item.course?.id === courseId
  }
  return false
}

export function EnrollButton({ batchId, courseId, priceMinor, className }: EnrollButtonProps) {
  const router = useRouter()
  const accessToken = useSelector((s: RootState) => s.auth.accessToken)
  const [createEnrollment, { isLoading: enrolling }] = useCreateEnrollmentMutation()
  const [initiatePayment, { isLoading: paying }] = useInitiatePaymentMutation()
  const { data: enrollmentsData, isLoading: loadingEnrollments } = useListEnrollmentsQuery(
    undefined,
    { skip: !accessToken },
  )
  const [error, setError] = useState<string | null>(null)

  const existing = useMemo(() => {
    const items = enrollmentsData?.data ?? []
    return items.find((item) => matchesProduct(item, batchId, courseId)) ?? null
  }, [enrollmentsData, batchId, courseId])

  const isLoading = enrolling || paying || loadingEnrollments

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

  async function startCheckout(enrollmentId: string) {
    const checkout = await initiatePayment({
      purpose: PaymentPurpose.ENROLLMENT,
      refId: enrollmentId,
    }).unwrap()
    window.location.href = checkout.data.redirectUrl
  }

  async function handleEnroll() {
    setError(null)
    try {
      if (
        existing &&
        (existing.status === EnrollmentStatus.ACTIVE ||
          existing.status === EnrollmentStatus.COMPLETED)
      ) {
        router.push(enrollmentPlayerPath(existing.kind, existing.id))
        return
      }

      if (existing?.status === EnrollmentStatus.PENDING && priceMinor > 0) {
        await startCheckout(existing.id)
        return
      }

      const result = await createEnrollment({ batchId, courseId }).unwrap()

      if (result.data.status === EnrollmentStatus.PENDING && priceMinor > 0) {
        await startCheckout(result.data.id)
        return
      }

      router.push(enrollmentPlayerPath(result.data.kind, result.data.id))
    } catch {
      setError("Could not enroll. You may already be enrolled or checkout failed.")
    }
  }

  if (
    existing &&
    (existing.status === EnrollmentStatus.ACTIVE ||
      existing.status === EnrollmentStatus.COMPLETED)
  ) {
    return (
      <div>
        <Button className={className} size="lg" variant="secondary" disabled>
          <Check className="mr-2 h-5 w-5" />
          Enrolled
        </Button>
        <p className="mt-2">
          <Link
            href={enrollmentPlayerPath(existing.kind, existing.id)}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Continue learning
          </Link>
        </p>
      </div>
    )
  }

  if (existing?.status === EnrollmentStatus.PENDING && priceMinor > 0) {
    return (
      <div>
        <Button
          className={className}
          size="lg"
          disabled={isLoading}
          onClick={() => void handleEnroll()}
        >
          {paying ? "Redirecting to payment…" : "Complete Payment"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </div>
    )
  }

  return (
    <div>
      <Button
        className={className}
        size="lg"
        disabled={isLoading}
        onClick={() => void handleEnroll()}
      >
        {isLoading ? "Enrolling…" : priceMinor > 0 ? "Enroll & Pay" : "Enroll Now"}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
