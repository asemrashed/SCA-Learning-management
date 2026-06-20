"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CoursePaymentGateModalProps {
  enrollmentId: string
  open: boolean
}

export function CoursePaymentGateModal({ enrollmentId, open }: CoursePaymentGateModalProps) {
  const router = useRouter()

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Pay course fee to access course</DialogTitle>
          <DialogDescription>
            Your monthly course fee is overdue. Send a payment request and wait for admin approval
            to restore full access.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/courses")}
          >
            Not now
          </Button>
          <Button
            type="button"
            onClick={() =>
              router.push(`/dashboard/courses/${enrollmentId}/payment-history`)
            }
          >
            Pay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
