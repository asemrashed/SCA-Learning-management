"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  useCreateLiveClassScheduleMutation,
  useDeleteLiveClassScheduleMutation,
  useDeleteSessionMutation,
  useListBatchLiveClassSchedulesQuery,
  useUpdateLiveClassScheduleMutation,
  useUpdateSessionMutation,
} from "@/features/liveclass/api"
import {
  combineDateAndTime,
  formatScheduleDay,
  formatTimeRange,
  sortLiveClasses,
  WEEKDAY_OPTIONS,
} from "@/features/liveclass/lib/schedule-format"
import { LiveClassType, type LiveClassSchedule } from "@/types/api"

type FormState = {
  type: LiveClassType
  subject: string
  daysOfWeek: number[]
  scheduledDate: string
  startTime: string
  endTime: string
  passcode: string
  joinUrl: string
}

const emptyForm = (): FormState => ({
  type: LiveClassType.RECURRING,
  subject: "",
  daysOfWeek: [],
  scheduledDate: "",
  startTime: "",
  endTime: "",
  passcode: "",
  joinUrl: "",
})

function formFromSchedule(schedule: LiveClassSchedule): FormState {
  return {
    type: schedule.type,
    subject: schedule.subject,
    daysOfWeek: [...schedule.daysOfWeek],
    scheduledDate: schedule.scheduledDate ?? "",
    startTime: schedule.startTime,
    endTime: schedule.endTime ?? "",
    passcode: schedule.passcode ?? "",
    joinUrl: schedule.joinUrl,
  }
}

function LiveClassForm({
  batchId,
  initial,
  editingSchedule,
  onDone,
}: {
  batchId: string
  initial: FormState
  editingSchedule: LiveClassSchedule | null
  onDone: () => void
}) {
  const [form, setForm] = useState<FormState>(initial)
  const [createSchedule, { isLoading: creating }] = useCreateLiveClassScheduleMutation()
  const [updateSchedule, { isLoading: updating }] = useUpdateLiveClassScheduleMutation()
  const [updateSession, { isLoading: updatingSession }] = useUpdateSessionMutation()
  const scopeKey = `batch-${batchId}`
  const saving = creating || updating || updatingSession
  const isRecurring = form.type === LiveClassType.RECURRING
  const editingId = editingSchedule?.id ?? null

  function toggleDay(day: number) {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.subject || !form.startTime || !form.joinUrl) return
    if (isRecurring && form.daysOfWeek.length === 0) return
    if (!isRecurring && !form.scheduledDate) return

    const payload = {
      type: form.type,
      subject: form.subject,
      startTime: form.startTime,
      endTime: form.endTime || undefined,
      passcode: form.passcode || undefined,
      joinUrl: form.joinUrl,
      ...(isRecurring
        ? { daysOfWeek: form.daysOfWeek }
        : { scheduledDate: form.scheduledDate }),
    }

    if (editingId && editingSchedule?.sessionId) {
      await updateSession({
        id: editingSchedule.sessionId,
        body: {
          title: form.subject,
          scheduledAt: combineDateAndTime(form.scheduledDate, form.startTime),
          joinUrl: form.joinUrl || null,
        },
        scopeKey,
      }).unwrap()
    } else if (editingId) {
      await updateSchedule({
        id: editingId,
        body: {
          ...payload,
          endTime: form.endTime || null,
          passcode: form.passcode || null,
          daysOfWeek: isRecurring ? form.daysOfWeek : [],
          scheduledDate: isRecurring ? null : form.scheduledDate,
        },
        scopeKey,
      }).unwrap()
    } else {
      await createSchedule({ batchId, ...payload }).unwrap()
    }
    onDone()
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="max-w-2xl space-y-4 rounded-xl border p-4">
      <h3 className="font-medium">{editingId ? "Edit live class" : "Add live class"}</h3>

      <div className="space-y-2">
        <Label>Live class type</Label>
        <Select
          value={form.type}
          onValueChange={(value) =>
            setForm((prev) => ({ ...prev, type: value as LiveClassType }))
          }
          disabled={Boolean(editingSchedule?.sessionId)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LiveClassType.RECURRING}>Repeated (weekly)</SelectItem>
            <SelectItem value={LiveClassType.ONE_TIME}>One-time session</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`subject-${batchId}`}>Subject</Label>
        <Input
          id={`subject-${batchId}`}
          value={form.subject}
          onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
          placeholder="e.g. Digital Marketing"
          required
        />
      </div>

      {isRecurring ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Days of week</legend>
          <div className="flex flex-wrap gap-3">
            {WEEKDAY_OPTIONS.map(({ label, value }) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.daysOfWeek.includes(value)}
                  onCheckedChange={() => toggleDay(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <div className="space-y-2">
          <Label htmlFor={`date-${batchId}`}>Date</Label>
          <Input
            id={`date-${batchId}`}
            type="date"
            value={form.scheduledDate}
            onChange={(e) => setForm((prev) => ({ ...prev, scheduledDate: e.target.value }))}
            required
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`start-${batchId}`}>Start time</Label>
          <Input
            id={`start-${batchId}`}
            type="time"
            value={form.startTime}
            onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`end-${batchId}`}>End time (optional)</Label>
          <Input
            id={`end-${batchId}`}
            type="time"
            value={form.endTime}
            onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`passcode-${batchId}`}>Passcode (optional)</Label>
        <Input
          id={`passcode-${batchId}`}
          value={form.passcode}
          onChange={(e) => setForm((prev) => ({ ...prev, passcode: e.target.value }))}
          placeholder="Meeting passcode"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`join-url-${batchId}`}>Meeting link (Zoom/Meet)</Label>
        <Input
          id={`join-url-${batchId}`}
          type="url"
          value={form.joinUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, joinUrl: e.target.value }))}
          placeholder="https://…"
          required
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="rounded-xl">
          {saving ? "Saving…" : editingId ? "Save changes" : "Add live class"}
        </Button>
        {editingId ? (
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}

function typeLabel(type: LiveClassType): string {
  return type === LiveClassType.RECURRING ? "Repeated" : "One-time"
}

function ScheduleRow({
  schedule,
  onEdit,
  onDelete,
}: {
  schedule: LiveClassSchedule
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border p-4">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{schedule.subject}</p>
          <Badge variant="outline">{typeLabel(schedule.type)}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{formatScheduleDay(schedule)}</p>
        <p className="text-sm text-muted-foreground">
          {formatTimeRange(schedule.startTime, schedule.endTime)}
        </p>
        {schedule.passcode ? (
          <p className="text-sm text-muted-foreground">Passcode: {schedule.passcode}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete live class?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove &quot;{schedule.subject}&quot; from the student schedule. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export function BatchLiveClassScheduleManager({ batchId }: { batchId: string }) {
  const { data, isLoading } = useListBatchLiveClassSchedulesQuery(batchId)
  const [deleteSchedule] = useDeleteLiveClassScheduleMutation()
  const [deleteSession] = useDeleteSessionMutation()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formKey, setFormKey] = useState(0)

  const schedules = sortLiveClasses(data?.data ?? [])
  const scopeKey = `batch-${batchId}`
  const editingSchedule = editingId ? schedules.find((s) => s.id === editingId) ?? null : null

  async function handleDelete(schedule: LiveClassSchedule) {
    if (schedule.sessionId) {
      await deleteSession({ id: schedule.sessionId, scopeKey }).unwrap()
    } else {
      await deleteSchedule({ id: schedule.id, scopeKey }).unwrap()
    }
  }

  function startEdit(schedule: LiveClassSchedule) {
    setEditingId(schedule.id)
    setFormKey((k) => k + 1)
  }

  function clearEdit() {
    setEditingId(null)
    setFormKey((k) => k + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Live classes</h3>
        <p className="text-sm text-muted-foreground">
          Add repeated weekly classes or one-time sessions for students.
        </p>
      </div>

      <LiveClassForm
        key={editingId ?? `new-${formKey}`}
        batchId={batchId}
        initial={editingSchedule ? formFromSchedule(editingSchedule) : emptyForm()}
        editingSchedule={editingSchedule}
        onDone={clearEdit}
      />

      {isLoading ? (
        <p className="text-muted-foreground">Loading live classes…</p>
      ) : schedules.length === 0 ? (
        <p className="text-muted-foreground">No live classes yet.</p>
      ) : (
        <div className="space-y-6">
          {schedules.some((s) => s.type === LiveClassType.RECURRING) ? (
            <section className="space-y-3">
              <h4 className="font-medium">Weekly classes</h4>
              <div className="space-y-3">
                {schedules
                  .filter((s) => s.type === LiveClassType.RECURRING)
                  .map((schedule) => (
                    <ScheduleRow
                      key={schedule.id}
                      schedule={schedule}
                      onEdit={() => startEdit(schedule)}
                      onDelete={() => void handleDelete(schedule)}
                    />
                  ))}
              </div>
            </section>
          ) : null}
          {schedules.some((s) => s.type === LiveClassType.ONE_TIME) ? (
            <section className="space-y-3">
              <h4 className="font-medium">One-time sessions</h4>
              <div className="space-y-3">
                {schedules
                  .filter((s) => s.type === LiveClassType.ONE_TIME)
                  .map((schedule) => (
                    <ScheduleRow
                      key={schedule.id}
                      schedule={schedule}
                      onEdit={() => startEdit(schedule)}
                      onDelete={() => void handleDelete(schedule)}
                    />
                  ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  )
}
