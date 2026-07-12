"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useListBatchesByCourseQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"
import { useListAdminEnrollmentRequestsQuery } from "@/features/enrollment/api"
import {
  useCreateManualPaymentMutation,
  useUpdateManualPaymentMutation,
} from "@/features/monthly-payment/api"
import { currentBillingMonthValue, formatBillingMonthLabel } from "@/lib/billing-month"
import { formatBdtMinor } from "@/lib/format-currency"
import {
  DeliveryMode,
  EnrollmentKind,
  EnrollmentStatus,
  type AdminEnrollmentRequest,
  type MonthlyPaymentRecord,
} from "@/types/api"

export interface AdminPaymentFormPrefill {
  enrollmentId?: string
  studentName?: string
  courseId?: string
  batchId?: string
  billingMonth?: string
  amountMinor?: number | null
  markFullyPaid?: boolean
  note?: string | null
  priceMinor?: number
  kind?: EnrollmentKind
}

interface AdminPaymentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  payment?: MonthlyPaymentRecord | null
  prefill?: AdminPaymentFormPrefill
}

function enrollmentLabel(item: AdminEnrollmentRequest): string {
  const product =
    item.kind === EnrollmentKind.BATCH
      ? `${item.batch?.course?.title ?? item.batch?.title ?? "Batch"} · ${item.batch?.title ?? ""}`
      : (item.course?.title ?? "Course")
  const id = item.idNumber ? ` · ID ${item.idNumber}` : ""
  return `${item.student.name} — ${product}${id}`
}

export function AdminPaymentFormDialog({
  open,
  onOpenChange,
  mode,
  payment,
  prefill,
}: AdminPaymentFormDialogProps) {
  const [courseId, setCourseId] = useState("")
  const [batchId, setBatchId] = useState("")
  const [studentSearch, setStudentSearch] = useState("")
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("")
  const [billingMonth, setBillingMonth] = useState(currentBillingMonthValue())
  const [amount, setAmount] = useState("")
  const [markFullyPaid, setMarkFullyPaid] = useState(false)
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)

  const { data: coursesData } = useListCoursesQuery({ deliveryMode: DeliveryMode.LIVE, pageSize: 100 })
  const { data: batchesData } = useListBatchesByCourseQuery(courseId, { skip: !courseId })
  const trimmedStudentSearch = studentSearch.trim()
  const showStudentList = trimmedStudentSearch.length > 0 && !selectedEnrollmentId

  const { data: enrollmentsData, isFetching: enrollmentsLoading } =
    useListAdminEnrollmentRequestsQuery(
      {
        status: EnrollmentStatus.ACTIVE,
        courseId: courseId || undefined,
        batchId: batchId || undefined,
        search: trimmedStudentSearch || undefined,
        pageSize: 20,
      },
      { skip: !open || mode === "edit" || !showStudentList },
    )

  const [createPayment, { isLoading: creating }] = useCreateManualPaymentMutation()
  const [updatePayment, { isLoading: updating }] = useUpdateManualPaymentMutation()
  const isLoading = creating || updating

  const enrollments = enrollmentsData?.data ?? []
  const selectedEnrollment =
    enrollments.find((item) => item.id === selectedEnrollmentId) ??
    (prefill?.enrollmentId
      ? ({
          id: prefill.enrollmentId,
          kind: prefill.kind ?? EnrollmentKind.BATCH,
          priceMinor: prefill.priceMinor ?? 0,
          student: { name: prefill.studentName ?? "Student" },
        } as AdminEnrollmentRequest)
      : null)

  const isRecordedCourse = selectedEnrollment?.kind === EnrollmentKind.COURSE
  const priceMinor = payment?.enrollment.priceMinor ?? selectedEnrollment?.priceMinor ?? prefill?.priceMinor ?? 0

  useEffect(() => {
    if (!open) return
    setError(null)
    if (mode === "edit" && payment) {
      setSelectedEnrollmentId(payment.enrollment.id)
      setCourseId(payment.enrollment.courseId ?? "")
      setBatchId(payment.enrollment.batchId ?? "")
      setBillingMonth(
        payment.billingMonth === "ENROLLMENT"
          ? currentBillingMonthValue()
          : payment.billingMonth,
      )
      setAmount(payment.amountMinor != null ? String(payment.amountMinor / 100) : "")
      setMarkFullyPaid(payment.enrollment.isFullyPaid)
      setNote(payment.note ?? "")
      setStudentSearch(payment.student.name)
      return
    }
    setCourseId(prefill?.courseId ?? "")
    setBatchId(prefill?.batchId ?? "")
    setSelectedEnrollmentId(prefill?.enrollmentId ?? "")
    setStudentSearch(prefill?.studentName ?? "")
    setBillingMonth(prefill?.billingMonth ?? currentBillingMonthValue())
    setAmount(
      prefill?.amountMinor != null && prefill.amountMinor > 0
        ? String(prefill.amountMinor / 100)
        : "",
    )
    setMarkFullyPaid(prefill?.markFullyPaid ?? false)
    setNote(prefill?.note ?? "")
  }, [open, mode, payment, prefill])

  useEffect(() => {
    if (mode === "create") {
      setBatchId("")
    }
  }, [courseId, mode])

  const monthValue = useMemo(() => {
    if (isRecordedCourse) return currentBillingMonthValue()
    return billingMonth
  }, [billingMonth, isRecordedCourse])

  async function handleSubmit() {
    const major = Number(amount.trim())
    if (!amount.trim() || Number.isNaN(major) || major <= 0) {
      setError("Enter a valid payment amount.")
      return
    }
    const amountMinor = Math.round(major * 100)
    if (priceMinor > 0 && amountMinor > priceMinor) {
      setError(`Amount cannot exceed ${formatBdtMinor(priceMinor)}.`)
      return
    }

    setError(null)
    try {
      if (mode === "edit" && payment) {
        await updatePayment({
          id: payment.id,
          body: {
            billingMonth: isRecordedCourse ? undefined : monthValue,
            amountMinor,
            note: note.trim() || null,
            markFullyPaid,
          },
        }).unwrap()
      } else {
        if (!selectedEnrollmentId) {
          setError("Select a student enrollment.")
          return
        }
        await createPayment({
          enrollmentId: selectedEnrollmentId,
          billingMonth: monthValue,
          amountMinor,
          note: note.trim() || undefined,
          markFullyPaid,
        }).unwrap()
      }
      onOpenChange(false)
    } catch {
      setError(mode === "edit" ? "Could not update payment." : "Could not add payment.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit payment" : "New payment"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the recorded payment. Changes appear in the student's payment history."
              : "Record a payment for an enrolled student."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mode === "create" ? (
            <>
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={courseId || "none"} onValueChange={(v) => setCourseId(v === "none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select course</SelectItem>
                    {(coursesData?.data ?? []).map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Batch</Label>
                <Select
                  value={batchId || "none"}
                  onValueChange={(v) => setBatchId(v === "none" ? "" : v)}
                  disabled={!courseId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All batches</SelectItem>
                    {(batchesData?.data ?? []).map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-search">Student</Label>
                <Input
                  id="student-search"
                  placeholder="Search name, phone, or ID"
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value)
                    setSelectedEnrollmentId("")
                  }}
                />
                {selectedEnrollmentId ? (
                  <p className="text-xs text-emerald-700">Student selected.</p>
                ) : null}
                {showStudentList ? (
                  <div className="max-h-40 overflow-y-auto rounded-lg border">
                    {enrollmentsLoading ? (
                      <p className="p-3 text-sm text-muted-foreground">Searching…</p>
                    ) : enrollments.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground">No active enrollments found.</p>
                    ) : (
                      enrollments.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => {
                            setSelectedEnrollmentId(item.id)
                            setStudentSearch(enrollmentLabel(item))
                            if (item.batch?.course?.id) setCourseId(item.batch.course.id)
                            if (item.batch?.id) setBatchId(item.batch.id)
                          }}
                        >
                          {enrollmentLabel(item)}
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-medium">{payment?.student.name}</p>
              <p className="text-muted-foreground">
                {payment?.enrollment.courseTitle}
                {payment?.enrollment.batchTitle ? ` · ${payment.enrollment.batchTitle}` : ""}
              </p>
            </div>
          )}

          {!isRecordedCourse ? (
            <div className="space-y-2">
              <Label htmlFor="billing-month">Billing month</Label>
              <Input
                id="billing-month"
                type="month"
                value={monthValue}
                onChange={(e) => setBillingMonth(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Fee will be recorded for {formatBillingMonthLabel(monthValue)}.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Recorded course payments are stored as one-time enrollment fees.
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="payment-amount">Amount received (৳)</Label>
            <Input
              id="payment-amount"
              type="number"
              min="0"
              step="0.01"
              max={priceMinor > 0 ? priceMinor / 100 : undefined}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {priceMinor > 0 ? (
              <p className="text-xs text-muted-foreground">Max {formatBdtMinor(priceMinor)}.</p>
            ) : null}
          </div>

          <label className="flex items-start gap-3 rounded-lg border p-3">
            <Checkbox checked={markFullyPaid} onCheckedChange={(v) => setMarkFullyPaid(v === true)} />
            <span className="space-y-1">
              <span className="block text-sm font-medium">Full paid (admin waiver)</span>
              <span className="block text-xs text-muted-foreground">
                Mark this enrollment as fully paid even if the amount received is lower. Future
                monthly fees will stop.
              </span>
            </span>
          </label>

          <div className="space-y-2">
            <Label htmlFor="payment-note">Note (optional)</Label>
            <Input
              id="payment-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Internal note"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={isLoading} onClick={() => void handleSubmit()}>
            {mode === "edit" ? "Save changes" : "Add payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
