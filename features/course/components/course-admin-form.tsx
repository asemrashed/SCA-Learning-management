"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
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
import { NativeSelect } from "@/components/native-select"
import { RichTextEditor } from "@/components/rich-text-editor"
import {
  useApplyBatchCurriculumMutation,
  useCreateCourseMutation,
  useGetCourseQuery,
  useUpdateCourseMutation,
} from "@/features/course/api"
import { useCreateBatchUnderCourseMutation, useGetBatchCurriculumQuery } from "@/features/batch/api"
import { fromDatetimeLocal } from "@/features/batch/datetime-local"
import { useListCategoriesQuery } from "@/features/category/api"
import {
  InitialBatchFields,
  emptyInitialBatchState,
} from "@/features/course/components/initial-batch-fields"
import {
  ModulesEditor,
  SubjectsEditor,
  modulesFromApi,
  modulesToPayload,
  newModule,
  newSubject,
  subjectsFromApi,
  subjectsToPayload,
  type ModuleForm,
  type SubjectForm,
} from "@/features/course/components/curriculum-editor"
import { deliveryModeLabel, EDIT_COURSE, NEW_BATCH, NEW_COURSE, SAVE_COURSE } from "@/lib/product-vocabulary"
import { isSuperAdmin } from "@/lib/roles"
import { DeliveryMode, type CreateCourseInput, type CourseFaqItem } from "@/types/api"

interface CourseAdminFormProps {
  courseId?: string
}

export function CourseAdminForm({ courseId }: CourseAdminFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useSelector((state: RootState) => state.auth.user)
  const canCreateDelete = user?.role !== undefined && isSuperAdmin(user.role)
  const initialBatchId = searchParams.get("batchId") ?? ""
  const isEdit = Boolean(courseId)
  const { data, isLoading } = useGetCourseQuery(courseId!, { skip: !courseId })
  const [createCourse, { isLoading: creating }] = useCreateCourseMutation()
  const [updateCourse, { isLoading: updating }] = useUpdateCourseMutation()
  const [createBatch, { isLoading: creatingBatch }] = useCreateBatchUnderCourseMutation()
  const [applyBatchCurriculum, { isLoading: applyingCurriculum }] =
    useApplyBatchCurriculumMutation()

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(DeliveryMode.RECORDED)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [priceMajor, setPriceMajor] = useState("0")
  const [isPublished, setIsPublished] = useState(false)
  const [modules, setModules] = useState<ModuleForm[]>([])
  const [subjects, setSubjects] = useState<SubjectForm[]>([])
  const [initialBatch, setInitialBatch] = useState(emptyInitialBatchState)
  const [primaryBatchId, setPrimaryBatchId] = useState("")
  const [applyBatchIds, setApplyBatchIds] = useState<string[]>([])
  const [showPreBatchCurriculum, setShowPreBatchCurriculum] = useState(false)
  const [sourceBatchId, setSourceBatchId] = useState("")
  const [faq, setFaq] = useState<CourseFaqItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [formReady, setFormReady] = useState(!isEdit)

  const { data: categoriesData, isLoading: categoriesLoading } = useListCategoriesQuery({
    pageSize: 100,
    sort: "order:asc",
  })
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
      if (deliveryMode === DeliveryMode.LIVE && subjects.length === 0) {
        setSubjects([newSubject(0)])
      }
    }
  }, [isEdit, deliveryMode, modules.length, subjects.length])

  useEffect(() => {
    if (!courseId) return
    setFormReady(false)
  }, [courseId])

  useEffect(() => {
    if (!data?.data || data.data.id !== courseId) return
    const c = data.data
    setDeliveryMode(c.deliveryMode)
    setTitle(c.title)
    setDescription(c.description ?? "")
    setThumbnail(c.thumbnail ?? "")
    setCategoryId(c.categoryId ?? "")
    setPriceMajor(String(c.priceMinor / 100))
    setIsPublished(c.isPublished)
    setFaq(c.faq ?? [])
    if (c.deliveryMode === DeliveryMode.RECORDED && c.modules) {
      setModules(modulesFromApi(c.modules))
    }
    setFormReady(true)
  }, [data, courseId])

  useEffect(() => {
    if (!data?.data || data.data.id !== courseId) return
    if (data.data.deliveryMode !== DeliveryMode.LIVE || !data.data.batches?.length) return
    const preferredBatch =
      initialBatchId && data.data.batches.some((b) => b.id === initialBatchId)
        ? initialBatchId
        : data.data.batches[0].id
    setPrimaryBatchId(preferredBatch)
    setApplyBatchIds([preferredBatch])
  }, [data, courseId, initialBatchId])

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
      description: description.trim() || null,
      thumbnail: thumbnail.trim() || null,
      categoryId: categoryId || null,
      faq: faq.filter((item) => item.question.trim() && item.answer.trim()),
      isPublished,
      ...(deliveryMode === DeliveryMode.RECORDED
        ? { priceMinor: Math.round(parseFloat(priceMajor || "0") * 100) }
        : {}),
    }

    try {
      if (isEdit && courseId) {
        const body =
          deliveryMode === DeliveryMode.RECORDED
            ? { ...base, modules: modulesToPayload(modules) }
            : base
        const courseResult = await updateCourse({ id: courseId, body }).unwrap()
        setCategoryId(courseResult.data.categoryId ?? "")

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
        if (deliveryMode === DeliveryMode.LIVE && !initialBatch.title.trim()) {
          setError("First batch title is required for live courses.")
          return
        }

        const body: CreateCourseInput =
          deliveryMode === DeliveryMode.RECORDED
            ? { deliveryMode: DeliveryMode.RECORDED, ...base, modules: modulesToPayload(modules) }
            : { deliveryMode: DeliveryMode.LIVE, ...base }
        const result = await createCourse(body).unwrap()

        if (deliveryMode === DeliveryMode.LIVE) {
          const batchResult = await createBatch({
            courseId: result.data.id,
            body: {
              title: initialBatch.title.trim(),
              status: initialBatch.status,
              thumbnail: initialBatch.thumbnail.trim() || null,
              priceMinor: Math.round(parseFloat(initialBatch.priceMajor || "0") * 100),
              capacity: initialBatch.capacity.trim() ? Number(initialBatch.capacity) : null,
              registrationDeadline: fromDatetimeLocal(initialBatch.registrationDeadline),
              startDate: fromDatetimeLocal(initialBatch.startDate),
              endDate: fromDatetimeLocal(initialBatch.endDate),
            },
          }).unwrap()

          const subjectPayload = subjectsToPayload(
            subjects.filter((subject) => subject.title.trim()),
          )
          if (subjectPayload.length > 0) {
            await applyBatchCurriculum({
              courseId: result.data.id,
              body: {
                batchIds: [batchResult.data.id],
                subjects: subjectPayload,
              },
            }).unwrap()
          }

          router.push(`/admin/courses/${result.data.id}/edit?batchId=${batchResult.data.id}`)
          return
        }

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

  if (isEdit && (!formReady || isLoading || categoriesLoading || data?.data?.id !== courseId)) {
    return <p className="text-muted-foreground">Loading course…</p>
  }

  const saving = creating || updating || creatingBatch || applyingCurriculum

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
            <Label htmlFor="category">Category</Label>
            <NativeSelect
              id="category"
              value={categoryId || "none"}
              onChange={(e) => setCategoryId(e.target.value === "none" ? "" : e.target.value)}
              disabled={categoriesLoading}
            >
              <option value="none">No category</option>
              {categoryOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Write about this course…"
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
          {deliveryMode === DeliveryMode.RECORDED ? (
            <div className="space-y-2">
              <Label htmlFor="price">Price (৳)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1"
                value={priceMajor}
                onChange={(e) => setPriceMajor(e.target.value)}
              />
            </div>
          ) : null}
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

      <div className="space-y-4 rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">FAQ</h3>
            <p className="text-sm text-muted-foreground">
              Questions and answers shown on the public course page.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFaq((prev) => [...prev, { question: "", answer: "" }])}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add question
          </Button>
        </div>
        {faq.length === 0 ? (
          <p className="text-sm text-muted-foreground">No FAQ items yet.</p>
        ) : (
          <div className="space-y-4">
            {faq.map((item, index) => (
              <div key={index} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <Label className="text-sm font-medium">Question {index + 1}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setFaq((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={item.question}
                  onChange={(e) =>
                    setFaq((prev) =>
                      prev.map((f, i) => (i === index ? { ...f, question: e.target.value } : f)),
                    )
                  }
                  placeholder="Question"
                />
                <Textarea
                  value={item.answer}
                  onChange={(e) =>
                    setFaq((prev) =>
                      prev.map((f, i) => (i === index ? { ...f, answer: e.target.value } : f)),
                    )
                  }
                  placeholder="Answer"
                  rows={3}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {deliveryMode === DeliveryMode.LIVE ? (
        <div className="space-y-4">
          {!isEdit ? (
            canCreateDelete ? (
              <>
                <InitialBatchFields value={initialBatch} onChange={setInitialBatch} />
                <SubjectsEditor subjects={subjects} onChange={setSubjects} />
              </>
            ) : null
          ) : courseBatches.length === 0 ? (
            <div className="space-y-4 rounded-xl border border-dashed p-6">
              <p className="text-sm text-muted-foreground">
                {canCreateDelete
                  ? "Create a batch under this course before adding subjects, chapters, and lessons."
                  : "No batch yet. A super admin must create one before curriculum can be added."}
              </p>
              {canCreateDelete && courseId ? (
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link href={`/admin/courses/${courseId}/batches/new`}>
                    <Plus className="mr-1 h-4 w-4" />
                    {NEW_BATCH}
                  </Link>
                </Button>
              ) : null}
            </div>
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
                  <div className="flex flex-wrap gap-2">
                    {canCreateDelete && courseId ? (
                      <Button type="button" variant="outline" size="sm" asChild>
                        <Link href={`/admin/courses/${courseId}/batches/new`}>
                          <Plus className="mr-1 h-4 w-4" />
                          {NEW_BATCH}
                        </Link>
                      </Button>
                    ) : null}
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
