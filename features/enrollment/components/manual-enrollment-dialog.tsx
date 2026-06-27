"use client"

import { useEffect, useState } from "react"
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
import { useCreateManualEnrollmentMutation } from "@/features/enrollment/api"
import { deliveryModeLabel } from "@/lib/product-vocabulary"
import { DeliveryMode } from "@/types/api"

interface ManualEnrollmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManualEnrollmentDialog({ open, onOpenChange }: ManualEnrollmentDialogProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [rollNumber, setRollNumber] = useState("")
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode.LIVE | DeliveryMode.RECORDED>(
    DeliveryMode.LIVE,
  )
  const [courseId, setCourseId] = useState("")
  const [batchId, setBatchId] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

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

  const courses =
    deliveryMode === DeliveryMode.LIVE
      ? (liveCoursesData?.data ?? [])
      : (recordedCoursesData?.data ?? [])
  const batches = batchesData?.data ?? []

  useEffect(() => {
    if (!open) return
    setCourseId("")
    setBatchId("")
    setFormError(null)
  }, [deliveryMode, open])

  useEffect(() => {
    setBatchId("")
  }, [courseId])

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

    try {
      await createManualEnrollment({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        rollNumber: rollNumber.trim(),
        ...(deliveryMode === DeliveryMode.LIVE ? { batchId } : { courseId }),
      }).unwrap()

      setName("")
      setPhone("")
      setEmail("")
      setRollNumber("")
      setCourseId("")
      setBatchId("")
      onOpenChange(false)
    } catch {
      setFormError("Could not create enrollment. Check the details and try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New enrollment</DialogTitle>
          <DialogDescription>
            Enroll a student directly without a pending request. Creates the student account if the
            phone number is new.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="manual-name">Full name</Label>
              <Input
                id="manual-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-phone">Phone</Label>
              <Input
                id="manual-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-email">Email (optional)</Label>
              <Input
                id="manual-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="manual-roll">Roll number</Label>
              <Input
                id="manual-roll"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Roll number"
                required
              />
            </div>
          </div>

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
