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
  useCreateCourseMutation,
  useGetCourseQuery,
  useUpdateCourseMutation,
} from "@/features/course/api"
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

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(DeliveryMode.RECORDED)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [category, setCategory] = useState("")
  const [priceMajor, setPriceMajor] = useState("0")
  const [isPublished, setIsPublished] = useState(false)
  const [modules, setModules] = useState<ModuleForm[]>([])
  const [subjects, setSubjects] = useState<SubjectForm[]>([])
  const [error, setError] = useState<string | null>(null)

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
    if (!data?.data) return
    const c = data.data
    setDeliveryMode(c.deliveryMode)
    setTitle(c.title)
    setSlug(c.slug)
    setSlugTouched(true)
    setDescription(c.description ?? "")
    setThumbnail(c.thumbnail ?? "")
    setCategory(c.category ?? "")
    setPriceMajor(String(c.priceMinor / 100))
    setIsPublished(c.isPublished)
    if (c.deliveryMode === DeliveryMode.LIVE && c.subjects) {
      setSubjects(subjectsFromApi(c.subjects))
    }
    if (c.deliveryMode === DeliveryMode.RECORDED && c.modules) {
      setModules(modulesFromApi(c.modules))
    }
  }, [data])

  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugify(title))
    }
  }, [title, slugTouched])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const base = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      thumbnail: thumbnail.trim() || null,
      category: category.trim() || null,
      priceMinor: Math.round(parseFloat(priceMajor || "0") * 100),
      isPublished,
    }

    try {
      if (isEdit && courseId) {
        const body =
          deliveryMode === DeliveryMode.LIVE
            ? { ...base, subjects: subjectsToPayload(subjects) }
            : { ...base, modules: modulesToPayload(modules) }
        await updateCourse({ id: courseId, body }).unwrap()
        router.refresh()
      } else {
        const body: CreateCourseInput =
          deliveryMode === DeliveryMode.LIVE
            ? { deliveryMode: DeliveryMode.LIVE, ...base, subjects: subjectsToPayload(subjects) }
            : { deliveryMode: DeliveryMode.RECORDED, ...base, modules: modulesToPayload(modules) }
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

  const saving = creating || updating

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
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
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
        <SubjectsEditor subjects={subjects} onChange={setSubjects} />
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
