"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"
import { useCreateEnrollmentMutation, useListEnrollmentsQuery } from "@/features/enrollment/api"
import { enrollmentPlayerPath } from "@/features/enrollment/utils"
import { enrollmentWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp"
import { EnrollmentKind, EnrollmentStatus } from "@/types/api"

interface EnrollButtonProps {
  batchId?: string
  courseId?: string
  productTitle: string
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

export function EnrollButton({ batchId, courseId, productTitle, className }: EnrollButtonProps) {
  const router = useRouter()
  const accessToken = useSelector((s: RootState) => s.auth.accessToken)
  const userName = useSelector((s: RootState) => s.auth.user?.name)
  const [createEnrollment, { isLoading: enrolling }] = useCreateEnrollmentMutation()
  const { data: enrollmentsData, isLoading: loadingEnrollments } = useListEnrollmentsQuery(
    undefined,
    { skip: !accessToken },
  )
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const existing = useMemo(() => {
    const items = enrollmentsData?.data ?? []
    return items.find((item) => matchesProduct(item, batchId, courseId)) ?? null
  }, [enrollmentsData, batchId, courseId])

  const isLoading = enrolling || loadingEnrollments

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

  async function handleConfirmEnroll() {
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

      if (existing?.status === EnrollmentStatus.PENDING) {
        setConfirmOpen(false)
        return
      }

      await createEnrollment({ batchId, courseId }).unwrap()
      setConfirmOpen(false)
      window.location.href = whatsappUrl(
        enrollmentWhatsAppMessage(productTitle, userName ?? undefined),
      )
    } catch {
      setError("Could not submit enrollment request. You may already be enrolled.")
      setConfirmOpen(false)
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
        {existing.rollNumber ? (
          <p className="mt-2 text-sm text-muted-foreground">Roll: {existing.rollNumber}</p>
        ) : null}
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

  if (existing?.status === EnrollmentStatus.PENDING) {
    return (
      <div>
        <Button className={className} size="lg" variant="secondary" disabled>
          <Check className="mr-2 h-5 w-5" />
          Request submitted
        </Button>
        <p className="mt-2 text-sm text-muted-foreground">
          An admin will review your request and assign your roll number.
        </p>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </div>
    )
  }

  return (
    <>
      <div>
        <Button
          className={className}
          size="lg"
          disabled={isLoading}
          onClick={() => setConfirmOpen(true)}
        >
          Enroll Now
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm payment by WhatsApp!</AlertDialogTitle>
            <AlertDialogDescription>
              After you confirm, your enrollment request will be submitted and you will be
              redirected to WhatsApp to complete payment with the admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={enrolling}>Cancel</AlertDialogCancel>
            <Button disabled={enrolling} onClick={() => void handleConfirmEnroll()}>
              {enrolling ? "Submitting…" : "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
