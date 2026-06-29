"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useListBatchesByCourseQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"
import {
  useCreateManualEnrollmentMutation,
  useLazySearchEnrollmentStudentsQuery,
} from "@/features/enrollment/api"
import { deliveryModeLabel } from "@/lib/product-vocabulary"
import { DeliveryMode, type EnrollmentStudentSearchResult } from "@/types/api"
import { cn } from "@/lib/utils"

const DEFAULT_FIRST_MONTH_FEE_MAJOR = "1000"

interface ManualEnrollmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function currentBillingMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function billingMonthOptions(): { value: string; label: string }[] {
  const year = new Date().getFullYear()
  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0")
    const value = `${year}-${month}`
    const label = new Date(year, index, 1).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    })
    return { value, label }
  })
}

function StudentSuggestions({
  results,
  onSelect,
  visible,
}: {
  results: EnrollmentStudentSearchResult[]
  onSelect: (student: EnrollmentStudentSearchResult) => void
  visible: boolean
}) {
  if (!visible || results.length === 0) return null

  return (
    <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover py-1 shadow-md">
      {results.map((student) => (
        <li key={student.id}>
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
            onClick={() => onSelect(student)}
          >
            <span className="font-medium">{student.name}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {student.phone}
              {student.email ? ` · ${student.email}` : ""}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export function ManualEnrollmentDialog({ open, onOpenChange }: ManualEnrollmentDialogProps) {
  const [studentId, setStudentId] = useState<string | undefined>()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [rollNumber, setRollNumber] = useState("")
  const [enrollmentFee, setEnrollmentFee] = useState("")
  const [firstMonthFee, setFirstMonthFee] = useState(DEFAULT_FIRST_MONTH_FEE_MAJOR)
  const [billingStartMonth, setBillingStartMonth] = useState(currentBillingMonth())
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode.LIVE | DeliveryMode.RECORDED>(
    DeliveryMode.LIVE,
  )
  const [courseId, setCourseId] = useState("")
  const [batchId, setBatchId] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [nameSearch, setNameSearch] = useState("")
  const [showNameSuggestions, setShowNameSuggestions] = useState(false)
  const nameFieldRef = useRef<HTMLDivElement>(null)

  const { data: liveCoursesData } = useListCoursesQuery(
    { deliveryMode: DeliveryMode.LIVE, pageSize: 100 },
    { skip: !open },
  )
  const { data: recordedCoursesData } = useListCoursesQuery(
    { deliveryMode: DeliveryMode.RECORDED, pageSize: 100 },
    { skip: !open },
  )
  const { data: batchesData } = useListBatchesByCourseQuery(courseId, {
    skip: !open || deliveryMode !== DeliveryMode.LIVE || !courseId,
  })

  const [createManualEnrollment, { isLoading }] = useCreateManualEnrollmentMutation()
  const [searchStudents, { data: nameSearchData }] = useLazySearchEnrollmentStudentsQuery()

  const courses =
    deliveryMode === DeliveryMode.LIVE
      ? (liveCoursesData?.data ?? [])
      : (recordedCoursesData?.data ?? [])
  const batches = batchesData?.data ?? []
  const nameResults = nameSearchData?.data ?? []
  const selectedRecordedCourse =
    deliveryMode === DeliveryMode.RECORDED
      ? courses.find((course) => course.id === courseId)
      : undefined

  useEffect(() => {
    if (!open) return
    setCourseId("")
    setBatchId("")
    setFormError(null)
    setStudentId(undefined)
    setNameSearch("")
    setRollNumber("")
    setEnrollmentFee("")
    setFirstMonthFee(DEFAULT_FIRST_MONTH_FEE_MAJOR)
    setBillingStartMonth(currentBillingMonth())
  }, [deliveryMode, open])

  useEffect(() => {
    setBatchId("")
    setFirstMonthFee(DEFAULT_FIRST_MONTH_FEE_MAJOR)
    setBillingStartMonth(currentBillingMonth())
  }, [courseId])

  useEffect(() => {
    if (deliveryMode !== DeliveryMode.RECORDED || !selectedRecordedCourse) return
    const major =
      selectedRecordedCourse.priceMinor > 0
        ? String(selectedRecordedCourse.priceMinor / 100)
        : ""
    setEnrollmentFee(major)
  }, [deliveryMode, selectedRecordedCourse])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => {
      const term = nameSearch.trim()
      if (term.length >= 1) {
        void searchStudents({ search: term, limit: 8 })
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [nameSearch, open, searchStudents])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (nameFieldRef.current && !nameFieldRef.current.contains(event.target as Node)) {
        setShowNameSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function applyStudent(student: EnrollmentStudentSearchResult) {
    setStudentId(student.id)
    setName(student.name)
    setPhone(student.phone)
    setEmail(student.email ?? "")
    setNameSearch(student.name)
    setShowNameSuggestions(false)
  }

  function resetStudentSelection() {
    setStudentId(undefined)
  }

  function parseAmountMajor(raw: string, label: string): number | null {
    const trimmed = raw.trim()
    if (!trimmed) return null
    const major = Number(trimmed)
    if (Number.isNaN(major) || major <= 0) {
      setFormError(`Enter a valid ${label}.`)
      return null
    }
    return Math.round(major * 100)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFormError(null)

    if (!name.trim() || !phone.trim() || !rollNumber.trim()) {
      setFormError("Name, phone, and roll number are required.")
      return
    }
    if (!courseId) {
      setFormError("Select a course.")
      return
    }
    if (deliveryMode === DeliveryMode.LIVE && !batchId) {
      setFormError("Select a batch for live enrollment.")
      return
    }

    let enrollmentFeeMinor: number | undefined
    let firstMonthFeeMinor: number | undefined

    if (deliveryMode === DeliveryMode.RECORDED) {
      const parsed = parseAmountMajor(enrollmentFee, "course price")
      if (parsed === null && enrollmentFee.trim()) return
      enrollmentFeeMinor = parsed ?? undefined
    } else {
      const parsed = parseAmountMajor(firstMonthFee, "first month fee")
      if (parsed === null) return
      firstMonthFeeMinor = parsed
      if (!billingStartMonth) {
        setFormError("Select the enrollment start month.")
        return
      }
    }

    try {
      await createManualEnrollment({
        ...(studentId ? { studentId } : {}),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        rollNumber: rollNumber.trim(),
        ...(deliveryMode === DeliveryMode.LIVE
          ? { batchId, billingStartMonth, firstMonthFeeMinor }
          : { courseId, ...(enrollmentFeeMinor ? { enrollmentFeeMinor } : {}) }),
      }).unwrap()

      setStudentId(undefined)
      setName("")
      setPhone("")
      setEmail("")
      setRollNumber("")
      setEnrollmentFee("")
      setFirstMonthFee(DEFAULT_FIRST_MONTH_FEE_MAJOR)
      setBillingStartMonth(currentBillingMonth())
      setNameSearch("")
      setCourseId("")
      setBatchId("")
      onOpenChange(false)
    } catch {
      setFormError("Could not create enrollment. Check the details and try again.")
    }
  }

  const showLivePricing = deliveryMode === DeliveryMode.LIVE && !!batchId
  const showRecordedPricing = deliveryMode === DeliveryMode.RECORDED && !!courseId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New enrollment</DialogTitle>
          <DialogDescription>
            Select the student, then the course or batch. Pricing appears after you choose the
            product. Roll number is assigned uniquely by you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div ref={nameFieldRef} className="relative space-y-2 sm:col-span-2">
              <Label htmlFor="manual-name">Full name</Label>
              <Input
                id="manual-name"
                value={nameSearch || name}
                onChange={(e) => {
                  const value = e.target.value
                  setNameSearch(value)
                  setName(value)
                  resetStudentSelection()
                  setShowNameSuggestions(true)
                }}
                onFocus={() => setShowNameSuggestions(true)}
                placeholder="Search or enter student name"
                required
                autoComplete="off"
              />
              <StudentSuggestions
                results={nameResults}
                visible={showNameSuggestions && nameSearch.trim().length >= 1}
                onSelect={applyStudent}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-phone">Phone</Label>
              <Input
                id="manual-phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  resetStudentSelection()
                }}
                placeholder="01XXXXXXXXX or +8801XXXXXXXXX"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-email">Email (optional)</Label>
              <Input
                id="manual-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  resetStudentSelection()
                }}
                placeholder="student@example.com"
              />
            </div>
          </div>

          {studentId ? (
            <p className={cn("text-xs text-emerald-700")}>Linked to existing student account.</p>
          ) : null}

          <div className="space-y-2">
            <Label>Course type</Label>
            <Select
              value={deliveryMode}
              onValueChange={(value) =>
                setDeliveryMode(value as DeliveryMode.LIVE | DeliveryMode.RECORDED)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DeliveryMode.LIVE}>
                  {deliveryModeLabel(DeliveryMode.LIVE)}
                </SelectItem>
                <SelectItem value={DeliveryMode.RECORDED}>
                  {deliveryModeLabel(DeliveryMode.RECORDED)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Course</Label>
            <Select value={courseId || undefined} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {deliveryMode === DeliveryMode.LIVE ? (
            <div className="space-y-2">
              <Label>Batch</Label>
              <Select value={batchId || undefined} onValueChange={setBatchId} disabled={!courseId}>
                <SelectTrigger>
                  <SelectValue placeholder={courseId ? "Select batch" : "Select a course first"} />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {showLivePricing ? (
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium">Live batch payment</p>
              <div className="space-y-2">
                <Label htmlFor="manual-billing-month">Enrollment start month</Label>
                <Select value={billingStartMonth} onValueChange={setBillingStartMonth}>
                  <SelectTrigger id="manual-billing-month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {billingMonthOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Access and billing apply from day 1 of this month.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-first-month-fee">First month fee (৳)</Label>
                <Input
                  id="manual-first-month-fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={firstMonthFee}
                  onChange={(e) => setFirstMonthFee(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Recorded as the first monthly payment. Student stays unblocked for this month even
                  after the 20th.
                </p>
              </div>
            </div>
          ) : null}

          {showRecordedPricing ? (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium">Recorded course price</p>
              <Label htmlFor="manual-enrollment-fee">Enrollment fee (৳)</Label>
              <Input
                id="manual-enrollment-fee"
                type="number"
                min="0"
                step="0.01"
                value={enrollmentFee}
                onChange={(e) => setEnrollmentFee(e.target.value)}
                placeholder={
                  selectedRecordedCourse && selectedRecordedCourse.priceMinor > 0
                    ? String(selectedRecordedCourse.priceMinor / 100)
                    : "e.g. 1500"
                }
              />
              <p className="text-xs text-muted-foreground">
                Filled from the course price. You can change it before enrolling.
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="manual-roll">Roll number</Label>
            <Input
              id="manual-roll"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="Enter unique roll number"
              required
              autoComplete="off"
            />
          </div>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating…" : "Create enrollment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
