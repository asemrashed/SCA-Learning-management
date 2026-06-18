"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ExternalLink, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/native-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MediaSourceField } from "@/components/media-source-field"
import {
  useCreateBatchUnderCourseMutation,
  useCreateContentGrantMutation,
  useDeleteContentGrantMutation,
  useGetBatchQuery,
  useListBatchesByCourseQuery,
  useListContentGrantsQuery,
  useUpdateBatchMutation,
} from "@/features/batch/api"
import type { BatchStatus, CreateBatchBodyInput } from "@/features/batch/types"
import { BATCH_STATUS_LABEL } from "@/features/batch/utils"
import { BATCH, EDIT_BATCH, NEW_BATCH, SAVE_BATCH } from "@/lib/product-vocabulary"

const BATCH_STATUSES: BatchStatus[] = [
  "DRAFT",
  "UPCOMING",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(value: string): string | null {
  if (!value.trim()) return null
  return new Date(value).toISOString()
}

interface BatchAdminFormProps {
  batchId?: string
  courseId?: string
  basePath?: string
}

const DEFAULT_BATCH_BASE = "/admin/batches"

export function BatchAdminForm({
  batchId,
  courseId,
  basePath = DEFAULT_BATCH_BASE,
}: BatchAdminFormProps) {
  const router = useRouter()
  const isEdit = Boolean(batchId)
  const { data, isLoading } = useGetBatchQuery(batchId!, { skip: !batchId })
  const [createBatch, { isLoading: creating }] = useCreateBatchUnderCourseMutation()
  const [updateBatch, { isLoading: updating }] = useUpdateBatchMutation()

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [status, setStatus] = useState<BatchStatus>("DRAFT")
  const [thumbnail, setThumbnail] = useState("")
  const [priceMajor, setPriceMajor] = useState("0")
  const [capacity, setCapacity] = useState("")
  const [registrationDeadline, setRegistrationDeadline] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [formReady, setFormReady] = useState(!isEdit)

  useEffect(() => {
    if (!batchId) return
    setFormReady(false)
  }, [batchId])

  useEffect(() => {
    if (!data?.data || data.data.id !== batchId) return
    const b = data.data
    setTitle(b.title)
    setSlug(b.slug)
    setSlugTouched(true)
    setStatus(b.status ?? "DRAFT")
    setThumbnail(b.thumbnail ?? "")
    setPriceMajor(String(b.priceMinor / 100))
    setCapacity(b.capacity != null ? String(b.capacity) : "")
    setRegistrationDeadline(toDatetimeLocal(b.registrationDeadline))
    setStartDate(toDatetimeLocal(b.startDate))
    setEndDate(toDatetimeLocal(b.endDate))
    setFormReady(true)
  }, [data, batchId])

  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugify(title))
    }
  }, [title, slugTouched])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const body: CreateBatchBodyInput = {
      title: title.trim(),
      slug: slug.trim(),
      status,
      thumbnail: thumbnail.trim() || null,
      priceMinor: Math.round(parseFloat(priceMajor || "0") * 100),
      capacity: capacity.trim() ? Number(capacity) : null,
      registrationDeadline: fromDatetimeLocal(registrationDeadline),
      startDate: fromDatetimeLocal(startDate),
      endDate: fromDatetimeLocal(endDate),
    }

    try {
      if (isEdit && batchId) {
        const result = await updateBatch({ id: batchId, body }).unwrap()
        setStatus(result.data.status ?? status)
        router.refresh()
      } else {
        const resolvedCourseId = courseId ?? data?.data?.courseId
        if (!resolvedCourseId) {
          setError("Parent course is required.")
          return
        }
        const result = await createBatch({ courseId: resolvedCourseId, body }).unwrap()
        router.push(`${basePath}/${result.data.id}/edit`)
      }
    } catch (err: unknown) {
      const apiErr = err as {
        data?: { error?: { message?: string; details?: { field: string; issue: string }[] } }
      }
      const details = apiErr.data?.error?.details
      const detailText = details?.length
        ? details.map((d) => `${d.field}: ${d.issue}`).join("; ")
        : null
      setError(
        detailText ??
          apiErr.data?.error?.message ??
          "Save failed. Check fields and try again.",
      )
    }
  }

  if (isEdit && (!formReady || isLoading || data?.data?.id !== batchId)) {
    return <p className="text-muted-foreground">Loading {BATCH.toLowerCase()}…</p>
  }

  const saving = creating || updating
  const publicSlug = data?.data?.slug ?? slug
  const parentCourse = data?.data?.course

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-4 rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{isEdit ? EDIT_BATCH : NEW_BATCH}</h2>
            {parentCourse ? (
              <p className="text-sm text-muted-foreground">
                Under course:{" "}
                <Link href={`/admin/courses/${parentCourse.id}`} className="text-primary hover:underline">
                  {parentCourse.title}
                </Link>
              </p>
            ) : null}
          </div>
          {isEdit && publicSlug ? (
            <div className="flex flex-wrap gap-2">
              {parentCourse && batchId ? (
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link href={`/admin/courses/${parentCourse.id}/edit?batchId=${batchId}`}>
                    <BookOpen className="mr-1 h-4 w-4" />
                    Edit curriculum
                  </Link>
                </Button>
              ) : null}
              <Button type="button" variant="outline" size="sm" asChild>
                <Link href={`/batches/${publicSlug}`} target="_blank">
                  <ExternalLink className="mr-1 h-4 w-4" />
                  View public page
                </Link>
              </Button>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Cohort title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <NativeSelect
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BatchStatus)}
            >
              {BATCH_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {BATCH_STATUS_LABEL[s] ?? s}
                </option>
              ))}
            </NativeSelect>
          </div>
          <MediaSourceField
            label="Thumbnail"
            value={thumbnail}
            onChange={setThumbnail}
            folder="images"
            accept="image/*"
            placeholder="https://…"
          />
          <div className="space-y-2">
            <Label htmlFor="price">Enrollment price (৳)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="1"
              value={priceMajor}
              onChange={(e) => setPriceMajor(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity (seats)</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              placeholder="Optional"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationDeadline">Registration deadline</Label>
            <Input
              id="registrationDeadline"
              type="datetime-local"
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End date (optional)</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isEdit && batchId && parentCourse ? (
        <BatchContentGrantsSection batchId={batchId} courseId={parentCourse.id} />
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : SAVE_BATCH}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push(basePath)}>
          Back to list
        </Button>
      </div>
    </form>
  )
}

function BatchContentGrantsSection({
  batchId,
  courseId,
}: {
  batchId: string
  courseId: string
}) {
  const { data: grantsData } = useListContentGrantsQuery(batchId)
  const { data: batchesData } = useListBatchesByCourseQuery(courseId)
  const [createGrant, { isLoading: creating }] = useCreateContentGrantMutation()
  const [deleteGrant] = useDeleteContentGrantMutation()
  const [grantingBatchId, setGrantingBatchId] = useState("")
  const [grantError, setGrantError] = useState<string | null>(null)

  const grants = grantsData?.data ?? []
  const siblingBatches = (batchesData?.data ?? []).filter((b) => b.id !== batchId)

  async function handleAddGrant() {
    if (!grantingBatchId) return
    setGrantError(null)
    try {
      await createGrant({ batchId, grantingBatchId }).unwrap()
      setGrantingBatchId("")
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: { message?: string } } }
      setGrantError(apiErr.data?.error?.message ?? "Failed to add grant.")
    }
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Pre-recorded access</h2>
        <p className="text-sm text-muted-foreground">
          Allow students in this batch to view recorded classes from previous batches.
        </p>
      </div>

      {grants.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {grants.map((grant) => (
            <li key={grant.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span>{grant.grantingBatch.title}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => deleteGrant({ batchId, grantId: grant.id })}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No previous-batch access granted yet.</p>
      )}

      {siblingBatches.length > 0 ? (
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[200px] flex-1 space-y-2">
            <Label>Grant access from batch</Label>
            <Select value={grantingBatchId || "none"} onValueChange={(v) => setGrantingBatchId(v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select batch</SelectItem>
                {siblingBatches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant="outline" disabled={!grantingBatchId || creating} onClick={handleAddGrant}>
            Add grant
          </Button>
        </div>
      ) : null}

      {grantError ? <p className="text-sm text-destructive">{grantError}</p> : null}
    </div>
  )
}
