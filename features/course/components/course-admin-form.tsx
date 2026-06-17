"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MediaSourceField } from "@/components/media-source-field"
import {
  useApplyBatchCurriculumMutation,
  useCreateCourseMutation,
  useGetCourseQuery,
  useUpdateCourseMutation,
} from "@/features/course/api"
import { useGetBatchCurriculumQuery } from "@/features/batch/api"
import { useListCategoriesQuery } from "@/features/category/api"
import {
  ModulesEditor,
  SubjectsEditor,
  modulesFromApi,
  modulesToPayload,
  newModule,
  subjectsFromApi,
  subjectsToPayload,
  type ModuleForm,
  type SubjectForm,
} from "@/features/course/components/curriculum-editor"
import { deliveryModeLabel, EDIT_COURSE, NEW_COURSE, SAVE_COURSE } from "@/lib/product-vocabulary"
import { DeliveryMode, type CreateCourseInput } from "@/types/api"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

interface CourseAdminFormProps {
  courseId?: string
}

export function CourseAdminForm({ courseId }: CourseAdminFormProps) {
  const router = useRouter()
  const isEdit = Boolean(courseId)
  const { data, isLoading } = useGetCourseQuery(courseId!, { skip: !courseId })
  const [createCourse, { isLoading: creating }] = useCreateCourseMutation()
  const [updateCourse, { isLoading: updating }] = useUpdateCourseMutation()
  const [applyBatchCurriculum, { isLoading: applyingCurriculum }] =
    useApplyBatchCurriculumMutation()

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(DeliveryMode.RECORDED)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [priceMajor, setPriceMajor] = useState("0")
  const [isPublished, setIsPublished] = useState(false)
  const [modules, setModules] = useState<ModuleForm[]>([])
  const [subjects, setSubjects] = useState<SubjectForm[]>([])
  const [primaryBatchId, setPrimaryBatchId] = useState("")
  const [applyBatchIds, setApplyBatchIds] = useState<string[]>([])
  const [showPreBatchCurriculum, setShowPreBatchCurriculum] = useState(false)
  const [sourceBatchId, setSourceBatchId] = useState("")
  const [error, setError] = useState<string | null>(null)

  const { data: categoriesData } = useListCategoriesQuery({ pageSize: 100, sort: "order:asc" })
  const categoryOptions = categoriesData?.data ?? []

  const courseBatches = data?.data?.batches ?? []
  const sourceBatchOptions = courseBatches.filter((b) => b.id !== primaryBatchId)
  const { data: curriculumData, isFetching: curriculumLoading } = useGetBatchCurriculumQuery(
    primaryBatchId,
    { skip: !primaryBatchId },
  )

  useEffect(() => {
    if (!isEdit) {
      if (deliveryMode === DeliveryMode.RECORDED && modules.length === 0) {
        setModules([newModule(0)])
      }
    }
  }, [isEdit, deliveryMode, modules.length])

  useEffect(() => {
    if (!data?.data) return
    const c = data.data
    setDeliveryMode(c.deliveryMode)
    setTitle(c.title)
    setSlug(c.slug)
    setSlugTouched(true)
    setDescription(c.description ?? "")
    setThumbnail(c.thumbnail ?? "")
    setCategoryId(c.categoryId ?? "")
    setPriceMajor(String(c.priceMinor / 100))
    setIsPublished(c.isPublished)
    if (c.deliveryMode === DeliveryMode.RECORDED && c.modules) {
      setModules(modulesFromApi(c.modules))
    }
    if (c.deliveryMode === DeliveryMode.LIVE && c.batches?.length && !primaryBatchId) {
      setPrimaryBatchId(c.batches[0].id)
      setApplyBatchIds([c.batches[0].id])
    }
  }, [data, primaryBatchId])

  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugify(title))
    }
  }, [title, slugTouched])

  useEffect(() => {
    if (!curriculumData?.data) return
    setSubjects(subjectsFromApi(curriculumData.data))
  }, [curriculumData])

  useEffect(() => {
    if (!primaryBatchId) return
    setApplyBatchIds((prev) => (prev.includes(primaryBatchId) ? prev : [primaryBatchId, ...prev]))
  }, [primaryBatchId])

  function toggleApplyBatch(batchId: string, checked: boolean) {
    setApplyBatchIds((prev) => {
      if (checked) return prev.includes(batchId) ? prev : [...prev, batchId]
      return prev.filter((id) => id !== batchId)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const base = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      thumbnail: thumbnail.trim() || null,
      categoryId: categoryId || null,
      priceMinor: Math.round(parseFloat(priceMajor || "0") * 100),
      isPublished,
    }

    try {
      if (isEdit && courseId) {
        const body =
          deliveryMode === DeliveryMode.RECORDED
            ? { ...base, modules: modulesToPayload(modules) }
            : base
        await updateCourse({ id: courseId, body }).unwrap()

        if (deliveryMode === DeliveryMode.LIVE && applyBatchIds.length > 0) {
          await applyBatchCurriculum({
            courseId,
            body: {
              batchIds: applyBatchIds,
              subjects: subjectsToPayload(subjects),
            },
          }).unwrap()
        }
        router.refresh()
      } else {
        const body: CreateCourseInput =
          deliveryMode === DeliveryMode.RECORDED
            ? { deliveryMode: DeliveryMode.RECORDED, ...base, modules: modulesToPayload(modules) }
            : { deliveryMode: DeliveryMode.LIVE, ...base }
        const result = await createCourse(body).unwrap()
        router.push(`/admin/courses/${result.data.id}/edit`)
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

  if (isEdit && isLoading) {
    return <p className="text-muted-foreground">Loading course…</p>
  }

  const saving = creating || updating || applyingCurriculum

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">{isEdit ? EDIT_COURSE : NEW_COURSE}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {!isEdit ? (
            <div className="space-y-2 sm:col-span-2">
              <Label>Delivery mode</Label>
              <Select
                value={deliveryMode}
                onValueChange={(v) => setDeliveryMode(v as DeliveryMode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DeliveryMode.RECORDED}>
                    {deliveryModeLabel(DeliveryMode.RECORDED)} — self-paced chapters
                  </SelectItem>
                  <SelectItem value={DeliveryMode.LIVE}>
                    {deliveryModeLabel(DeliveryMode.LIVE)} — subjects + yearly batches
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2 sm:col-span-2">
              <Label>Delivery mode</Label>
              <p className="text-sm text-muted-foreground">{deliveryModeLabel(deliveryMode)}</p>
            </div>
          )}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
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
            <Label htmlFor="category">Category</Label>
            <Select
              value={categoryId || "none"}
              onValueChange={(value) => setCategoryId(value === "none" ? "" : value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
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
            <Label htmlFor="price">
              {deliveryMode === DeliveryMode.LIVE ? "Display price (৳)" : "Price (৳)"}
            </Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="1"
              value={priceMajor}
              onChange={(e) => setPriceMajor(e.target.value)}
            />
            {deliveryMode === DeliveryMode.LIVE ? (
              <p className="text-xs text-muted-foreground">
                Enrollment price is set per batch cohort.
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox
              id="published"
              checked={isPublished}
              onCheckedChange={(v) => setIsPublished(v === true)}
            />
            <Label htmlFor="published">Published (visible in public catalog)</Label>
          </div>
        </div>
      </div>

      {deliveryMode === DeliveryMode.LIVE ? (
        <div className="space-y-4">
          {courseBatches.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              Create a batch under this course before adding subjects, chapters, and lessons.
            </p>
          ) : (
            <>
              <div className="space-y-4 rounded-xl border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">Batch curriculum</h3>
                    <p className="text-sm text-muted-foreground">
                      Pick the batch to edit. Add subjects, chapters, and lessons from the tree
                      below.
                    </p>
                  </div>
                  {sourceBatchOptions.length > 0 ? (
                    <Button
                      type="button"
                      variant={showPreBatchCurriculum ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setShowPreBatchCurriculum((v) => {
                          const next = !v
                          if (!next) setSourceBatchId("")
                          return next
                        })
                      }}
                    >
                      Show pre-batch curriculum
                    </Button>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Edit curriculum for batch</Label>
                  <Select value={primaryBatchId} onValueChange={setPrimaryBatchId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseBatches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {showPreBatchCurriculum && sourceBatchOptions.length > 0 ? (
                  <div className="space-y-2 rounded-lg border border-dashed bg-muted/30 p-4">
                    <Label>Copy from previous batch</Label>
                    <Select
                      value={sourceBatchId || "none"}
                      onValueChange={(v) => setSourceBatchId(v === "none" ? "" : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select previous batch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select batch</SelectItem>
                        {sourceBatchOptions.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      When adding a subject, chapter, or lesson, you can copy names from this batch.
                    </p>
                  </div>
                ) : null}
                {courseBatches.length > 1 ? (
                  <div className="space-y-2">
                    <Label>Also apply to batches on save</Label>
                    <div className="flex flex-wrap gap-3">
                      {courseBatches.map((b) => (
                        <label key={b.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={applyBatchIds.includes(b.id)}
                            onCheckedChange={(v) => toggleApplyBatch(b.id, v === true)}
                          />
                          {b.title}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              {curriculumLoading ? (
                <p className="text-sm text-muted-foreground">Loading curriculum…</p>
              ) : (
                <SubjectsEditor
                  subjects={subjects}
                  onChange={setSubjects}
                  showPreBatchCurriculum={showPreBatchCurriculum && Boolean(sourceBatchId)}
                  sourceBatchId={sourceBatchId}
                />
              )}
            </>
          )}
        </div>
      ) : (
        <ModulesEditor modules={modules} onChange={setModules} />
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : SAVE_COURSE}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/courses")}>
          Back to list
        </Button>
      </div>
    </form>
  )
}
