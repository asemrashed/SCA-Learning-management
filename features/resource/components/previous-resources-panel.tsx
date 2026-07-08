"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetBatchCurriculumQuery, useListBatchesByCourseQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"
import { useCreateResourceMutation, useListResourcesQuery } from "@/features/resource/api"
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import { BATCH, CHAPTER } from "@/lib/product-vocabulary"
import {
  CONTENT_RESOURCE_CATEGORIES,
  RESOURCE_CATEGORY_LABELS,
  isBatchScopedCategory,
  isSubjectRequiredCategory,
} from "@/lib/resource-categories"
import type { CurriculumPlacement } from "@/components/curriculum-placement-picker"
import type { ResourceItem } from "@/types/api"
import { DeliveryMode, ResourceCategory } from "@/types/api"

const LINKABLE_CATEGORIES = [
  ResourceCategory.LECTURE_SHEET,
  ResourceCategory.SOLUTION_PDF,
  ResourceCategory.MATH_SUGGESTION,
  ResourceCategory.THEORY_SUGGESTION,
] as const

interface PreviousResourcesPanelProps {
  /** Target course for newly linked resources */
  targetCourseId: string
  targetPlacement: CurriculumPlacement
  defaultCategory?: ResourceCategory
  lockCategory?: boolean
  isLiveTarget: boolean
  onLinked?: () => void
  onUseFile?: (resource: ResourceItem) => void
}

export function PreviousResourcesPanel({
  targetCourseId,
  targetPlacement,
  defaultCategory,
  lockCategory = false,
  isLiveTarget,
  onLinked,
  onUseFile,
}: PreviousResourcesPanelProps) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<ResourceCategory>(
    defaultCategory && LINKABLE_CATEGORIES.includes(defaultCategory as (typeof LINKABLE_CATEGORIES)[number])
      ? defaultCategory
      : ResourceCategory.LECTURE_SHEET,
  )
  const [sourceCourseId, setSourceCourseId] = useState("")
  const [sourceBatchId, setSourceBatchId] = useState("")
  const [sourceSubjectId, setSourceSubjectId] = useState("")
  const [linkingId, setLinkingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [createResource] = useCreateResourceMutation()

  const { data: coursesData } = useListCoursesQuery({ pageSize: 100, sort: "title:asc" }, { skip: !open })
  const courses = coursesData?.data ?? []
  const sourceCourse = courses.find((c) => c.id === sourceCourseId)
  const sourceIsLive = sourceCourse?.deliveryMode === DeliveryMode.LIVE

  const { data: batchesData } = useListBatchesByCourseQuery(sourceCourseId, {
    skip: !open || !sourceCourseId || !sourceIsLive,
  })
  const batches = batchesData?.data ?? []

  const { data: curriculumData } = useGetBatchCurriculumQuery(sourceBatchId, {
    skip: !open || !sourceBatchId || !sourceIsLive,
  })
  const subjects = curriculumData?.data ?? []

  const canQuery =
    open &&
    Boolean(sourceCourseId) &&
    Boolean(category) &&
    (!sourceIsLive || (Boolean(sourceBatchId) && Boolean(sourceSubjectId)))

  const { data: resourcesData, isFetching } = useListResourcesQuery(
    {
      courseId: sourceCourseId,
      category,
      pageSize: 100,
      sort: "createdAt:desc",
      ...(sourceIsLive && sourceBatchId ? { batchId: sourceBatchId } : {}),
      ...(sourceIsLive && sourceSubjectId ? { subjectId: sourceSubjectId } : {}),
    },
    { skip: !canQuery },
  )

  const resources = resourcesData?.data ?? []

  const categoryOptions = useMemo(() => {
    if (lockCategory && defaultCategory) {
      return [[defaultCategory, RESOURCE_CATEGORY_LABELS[defaultCategory]]] as [
        ResourceCategory,
        string,
      ][]
    }
    return LINKABLE_CATEGORIES.map(
      (key) => [key, RESOURCE_CATEGORY_LABELS[key]] as [ResourceCategory, string],
    ).filter(([key]) => CONTENT_RESOURCE_CATEGORIES.has(key))
  }, [lockCategory, defaultCategory])

  function resetSource() {
    setSourceBatchId("")
    setSourceSubjectId("")
  }

  async function linkResource(source: ResourceItem) {
    setError(null)
    setSuccess(null)

    if (!targetCourseId) {
      setError("Select a course placement first.")
      return
    }

    if (isLiveTarget && isBatchScopedCategory(category) && !targetPlacement.batchId) {
      setError(`Select a ${BATCH.toLowerCase()} in the form below before linking.`)
      return
    }

    if (isLiveTarget && isSubjectRequiredCategory(category, true) && !targetPlacement.subjectId) {
      setError("Select a subject in the form below before linking.")
      return
    }

    const fileUrl = source.fileUrl?.trim()
    if (!fileUrl) {
      setError("That resource has no file URL to link.")
      return
    }

    setLinkingId(source.id)
    try {
      await createResource({
        title: source.title,
        fileUrl,
        fileType: (source.fileType as "pdf" | "slide" | "link") ?? "pdf",
        category: source.category,
        courseId: targetCourseId,
        batchId: targetPlacement.batchId ?? null,
        subjectId: targetPlacement.subjectId ?? null,
        moduleId: targetPlacement.moduleId ?? null,
        lessonId: targetPlacement.lessonId ?? null,
      }).unwrap()
      setSuccess(`Linked “${source.title}” (same file, no re-upload).`)
      onLinked?.()
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not link resource."))
    } finally {
      setLinkingId(null)
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Previous resources</p>
          <p className="text-xs text-muted-foreground">
            Link existing PDFs from another course or batch. Files are reused — not copied.
          </p>
        </div>
        <Button
          type="button"
          variant={open ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setOpen((v) => !v)
            setError(null)
            setSuccess(null)
          }}
        >
          {open ? "Hide previous resources" : "Show previous resources"}
        </Button>
      </div>

      {open ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Resource type</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as ResourceCategory)}
                disabled={lockCategory}
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

            <div className="space-y-1">
              <Label className="text-xs">Course</Label>
              <Select
                value={sourceCourseId || "none"}
                onValueChange={(v) => {
                  setSourceCourseId(v === "none" ? "" : v)
                  resetSource()
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select course</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sourceIsLive ? (
              <>
                <div className="space-y-1">
                  <Label className="text-xs">{BATCH}</Label>
                  <Select
                    value={sourceBatchId || "none"}
                    onValueChange={(v) => {
                      setSourceBatchId(v === "none" ? "" : v)
                      setSourceSubjectId("")
                    }}
                    disabled={!sourceCourseId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${BATCH.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select {BATCH.toLowerCase()}</SelectItem>
                      {batches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Subject</Label>
                  <Select
                    value={sourceSubjectId || "none"}
                    onValueChange={(v) => setSourceSubjectId(v === "none" ? "" : v)}
                    disabled={!sourceBatchId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select subject</SelectItem>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {success ? <p className="text-sm text-green-700">{success}</p> : null}

          {!canQuery ? (
            <p className="text-xs text-muted-foreground">
              {sourceIsLive
                ? "Select course, batch, and subject to list resources for every chapter under that subject."
                : "Select a course to list its resources."}
            </p>
          ) : isFetching ? (
            <p className="text-sm text-muted-foreground">Loading resources…</p>
          ) : resources.length === 0 ? (
            <p className="text-sm text-muted-foreground">No resources found for this filter.</p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto rounded-md border bg-background p-2">
              {resources.map((resource) => (
                <li
                  key={resource.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{resource.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {RESOURCE_CATEGORY_LABELS[resource.category]}
                      {resource.moduleId ? ` · ${CHAPTER}` : ""}
                      {resource.lessonId ? " · Lesson" : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {onUseFile ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onUseFile(resource)}
                      >
                        Use file
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      disabled={linkingId === resource.id}
                      onClick={() => void linkResource(resource)}
                    >
                      {linkingId === resource.id ? "Linking…" : "Link here"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">
            <strong>Link here</strong> attaches the same file URL to the placement selected in the
            form below (no upload). <strong>Use file</strong> fills the form so you can adjust the
            title before saving.
          </p>
        </div>
      ) : null}
    </div>
  )
}
