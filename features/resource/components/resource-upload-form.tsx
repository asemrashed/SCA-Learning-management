"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MediaSourceField } from "@/components/media-source-field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CurriculumPlacementPicker,
  type CurriculumPlacement,
} from "@/components/curriculum-placement-picker"
import { useGetBatchQuery } from "@/features/batch/api"
import { useGetCourseQuery } from "@/features/course/api"
import {
  useCreateResourceMutation,
  useUpdateResourceMutation,
} from "@/features/resource/api"
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import { BATCH, CHAPTER } from "@/lib/product-vocabulary"
import {
  ASSESSMENT_RESOURCE_CATEGORIES,
  CONTENT_RESOURCE_CATEGORIES,
  isBatchScopedCategory,
  isDeadlineCategory,
  isPdfResourceCategory,
  isSubjectRequiredCategory,
  RESOURCE_CATEGORY_LABELS,
} from "@/lib/resource-categories"
import type { ResourceItem } from "@/types/api"
import { DeliveryMode, ResourceCategory } from "@/types/api"

const initialPlacement: CurriculumPlacement = {
  batchId: null,
  subjectId: null,
  moduleId: null,
  lessonId: null,
}

function toDeadlineInputValue(iso: string | null | undefined): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface ResourceFormProps {
  fixedBatchId?: string
  fixedCourseId?: string
  defaultCategory?: ResourceCategory
  lockCategory?: boolean
  resource?: ResourceItem
  onSuccess?: () => void
  inModal?: boolean
}

export function ResourceForm({
  fixedBatchId,
  fixedCourseId,
  defaultCategory = ResourceCategory.GENERAL,
  lockCategory = false,
  resource,
  onSuccess,
  inModal = false,
}: ResourceFormProps) {
  const isEdit = Boolean(resource)
  const { data: fixedBatch } = useGetBatchQuery(fixedBatchId ?? "", { skip: !fixedBatchId })

  const [title, setTitle] = useState(resource?.title ?? "")
  const [fileUrl, setFileUrl] = useState(resource?.fileUrl ?? "")
  const [fileType, setFileType] = useState<"pdf" | "slide" | "link">(
    (resource?.fileType as "pdf" | "slide" | "link") ?? "pdf",
  )
  const [category, setCategory] = useState<ResourceCategory>(
    resource?.category ?? defaultCategory,
  )
  const [deadlineAt, setDeadlineAt] = useState(toDeadlineInputValue(resource?.deadlineAt))
  const [placement, setPlacement] = useState<CurriculumPlacement>({
    ...initialPlacement,
    courseId: fixedCourseId ?? resource?.courseId ?? undefined,
    batchId: fixedBatchId ?? resource?.batchId ?? null,
    subjectId: resource?.subjectId ?? null,
    moduleId: resource?.moduleId ?? null,
    lessonId: resource?.lessonId ?? null,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [createResource, { isLoading: creating }] = useCreateResourceMutation()
  const [updateResource, { isLoading: updating }] = useUpdateResourceMutation()
  const isLoading = creating || updating

  const courseIdForQuery =
    placement.courseId?.trim() ||
    fixedCourseId ||
    fixedBatch?.data?.courseId ||
    resource?.courseId ||
    ""
  const { data: courseData } = useGetCourseQuery(courseIdForQuery, { skip: !courseIdForQuery })
  const isLive = courseData?.data?.deliveryMode === DeliveryMode.LIVE

  const pdfOnly = isPdfResourceCategory(category)
  const subjectRequired = isSubjectRequiredCategory(category)
  const requireBatch = isLive && isBatchScopedCategory(category)
  const showDeadline = isDeadlineCategory(category)

  const categoryOptions = useMemo(() => {
    if (lockCategory) {
      return [[category, RESOURCE_CATEGORY_LABELS[category]]] as [ResourceCategory, string][]
    }
    if (defaultCategory && ASSESSMENT_RESOURCE_CATEGORIES.has(defaultCategory)) {
      return [[defaultCategory, RESOURCE_CATEGORY_LABELS[defaultCategory]]] as [
        ResourceCategory,
        string,
      ][]
    }
    return (
      Object.entries(RESOURCE_CATEGORY_LABELS) as [ResourceCategory, string][]
    ).filter(([key]) => CONTENT_RESOURCE_CATEGORIES.has(key))
  }, [lockCategory, category, defaultCategory])

  useEffect(() => {
    if (pdfOnly && fileType !== "pdf") {
      setFileType("pdf")
    }
  }, [pdfOnly, fileType])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const courseId =
      placement.courseId?.trim() ||
      fixedCourseId ||
      fixedBatch?.data?.courseId ||
      resource?.courseId

    if (!courseId) {
      setError("Please select a course.")
      return
    }

    if (
      category === ResourceCategory.GENERAL &&
      !placement.moduleId &&
      !placement.lessonId
    ) {
      setError(`General resources need a ${CHAPTER.toLowerCase()} or lesson.`)
      return
    }

    if (requireBatch && !placement.batchId) {
      setError(`Please select a ${BATCH.toLowerCase()}.`)
      return
    }

    if (isLive && subjectRequired && !placement.subjectId) {
      setError("Please select a subject.")
      return
    }

    if (showDeadline && !deadlineAt.trim()) {
      setError("Please set a deadline.")
      return
    }

    if (!fileUrl.trim()) {
      setError("Upload a PDF or paste a file link.")
      return
    }

    const payload = {
      title,
      fileUrl,
      fileType: pdfOnly ? ("pdf" as const) : fileType,
      category,
      courseId,
      batchId: placement.batchId ?? null,
      subjectId: placement.subjectId ?? null,
      moduleId: placement.moduleId ?? null,
      lessonId: placement.lessonId ?? null,
      deadlineAt: showDeadline && deadlineAt ? new Date(deadlineAt).toISOString() : null,
    }

    try {
      if (isEdit && resource) {
        await updateResource({
          id: resource.id,
          body: {
            title: payload.title,
            fileUrl: payload.fileUrl,
            fileType: payload.fileType,
            category: payload.category,
            batchId: payload.batchId,
            subjectId: payload.subjectId,
            moduleId: payload.moduleId,
            lessonId: payload.lessonId,
            deadlineAt: payload.deadlineAt,
          },
        }).unwrap()
        setSuccess("Resource updated.")
      } else {
        await createResource(payload).unwrap()
        setTitle("")
        setFileUrl("")
        setDeadlineAt("")
        setPlacement({
          ...initialPlacement,
          courseId: fixedCourseId ?? courseId,
          batchId: fixedBatchId ?? null,
        })
        setSuccess("Resource saved.")
      }
      onSuccess?.()
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save resource. Check fields and try again."))
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={inModal ? "space-y-6" : "space-y-6 rounded-xl border bg-card p-6"}
    >
      {!inModal ? (
        <>
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit resource" : "Add resource"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Upload PDFs for lecture sheets, solution PDFs, notices, and result sheets.
          </p>
        </>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-green-700">{success}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="resource-title">Title</Label>
          <Input
            id="resource-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {!lockCategory ? (
          <div className="space-y-2">
            <Label>Resource type</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as ResourceCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Resource type</Label>
            <p className="text-sm text-muted-foreground">
              {RESOURCE_CATEGORY_LABELS[category]}
            </p>
          </div>
        )}

        {showDeadline ? (
          <div className="space-y-2">
            <Label htmlFor="resource-deadline">Deadline</Label>
            <Input
              id="resource-deadline"
              type="datetime-local"
              value={deadlineAt}
              onChange={(e) => setDeadlineAt(e.target.value)}
              required
            />
          </div>
        ) : null}

        {!pdfOnly ? (
          <div className="space-y-2">
            <Label>File format</Label>
            <Select value={fileType} onValueChange={(v) => setFileType(v as typeof fileType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="slide">Slide</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <MediaSourceField
          label={pdfOnly ? "PDF file" : "File"}
          value={fileUrl}
          onChange={setFileUrl}
          folder="documents"
          accept={pdfOnly ? ".pdf,application/pdf" : ".pdf,.ppt,.pptx,image/*"}
          placeholder="Upload or paste URL"
        />

        <CurriculumPlacementPicker
          className="contents sm:col-span-2"
          value={placement}
          onChange={setPlacement}
          fixedBatchId={fixedBatchId}
          fixedCourseId={fixedCourseId ?? resource?.courseId ?? undefined}
          requireBatch={requireBatch}
          subjectRequired={isLive && subjectRequired}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving…" : isEdit ? "Update resource" : "Save resource"}
      </Button>
    </form>
  )
}

/** @deprecated Use ResourceForm */
export function ResourceUploadForm(props: ResourceFormProps) {
  return <ResourceForm {...props} />
}
