"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
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
import {
  useCreateCourseMutation,
  useGetCourseQuery,
  useUpdateCourseMutation,
} from "@/features/course/api"
import { LessonType, type CourseInputModule, type CreateCourseInput } from "@/types/api"

interface LessonForm {
  key: string
  title: string
  type: LessonType
  videoUrl?: string | null
  content?: string | null
  durationS?: number | null
  order: number
  isPreview: boolean
}

interface ModuleForm {
  key: string
  title: string
  order: number
  lessons: LessonForm[]
}

let nextFormKey = 0
function formKey(prefix: string): string {
  nextFormKey += 1
  return `${prefix}-${nextFormKey}`
}

function newLesson(order: number): LessonForm {
  return {
    key: formKey("lesson"),
    title: "",
    type: LessonType.VIDEO,
    order,
    isPreview: false,
    videoUrl: "",
    content: "",
    durationS: null,
  }
}

function newModule(order: number): ModuleForm {
  return {
    key: formKey("module"),
    title: "",
    order,
    lessons: [newLesson(0)],
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function modulesFromCourse(modules: CreateCourseInput["modules"]): ModuleForm[] {
  if (!modules?.length) return [newModule(0)]
  return modules.map((mod, mi) => ({
    key: formKey("module"),
    title: mod.title,
    order: mod.order ?? mi,
    lessons: (mod.lessons ?? []).map((lesson, li) => ({
      key: formKey("lesson"),
      title: lesson.title,
      type: lesson.type ?? LessonType.VIDEO,
      order: lesson.order ?? li,
      isPreview: lesson.isPreview ?? false,
      videoUrl: lesson.videoUrl ?? "",
      content: lesson.content ?? "",
      durationS: lesson.durationS ?? null,
    })),
  }))
}

function toPayload(modules: ModuleForm[]): CourseInputModule[] {
  return modules.map((mod, mi) => ({
    title: mod.title,
    order: mi,
    lessons: mod.lessons.map((lesson, li) => ({
      title: lesson.title,
      type: lesson.type,
      order: li,
      isPreview: lesson.isPreview,
      videoUrl: lesson.videoUrl || null,
      content: lesson.content || null,
      durationS: lesson.durationS ? Number(lesson.durationS) : null,
    })),
  }))
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

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [category, setCategory] = useState("")
  const [priceMajor, setPriceMajor] = useState("0")
  const [isPublished, setIsPublished] = useState(false)
  const [modules, setModules] = useState<ModuleForm[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit && modules.length === 0) {
      setModules([newModule(0)])
    }
  }, [isEdit, modules.length])

  useEffect(() => {
    if (!data?.data) return
    const c = data.data
    setTitle(c.title)
    setSlug(c.slug)
    setSlugTouched(true)
    setDescription(c.description ?? "")
    setThumbnail(c.thumbnail ?? "")
    setCategory(c.category ?? "")
    setPriceMajor(String(c.priceMinor / 100))
    setIsPublished(c.isPublished)
    setModules(
      modulesFromCourse(
        c.modules.map((m) => ({
          title: m.title,
          order: m.order,
          lessons: m.lessons.map((l) => ({
            title: l.title,
            type: l.type,
            order: l.order,
            isPreview: l.isPreview,
            videoUrl: l.videoUrl,
            content: l.content,
            durationS: l.durationS,
          })),
        })),
      ),
    )
  }, [data])

  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugify(title))
    }
  }, [title, slugTouched])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const body: CreateCourseInput = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      thumbnail: thumbnail.trim() || null,
      category: category.trim() || null,
      priceMinor: Math.round(parseFloat(priceMajor || "0") * 100),
      isPublished,
      modules: toPayload(modules),
    }

    try {
      if (isEdit && courseId) {
        await updateCourse({ id: courseId, body }).unwrap()
        router.refresh()
      } else {
        const result = await createCourse(body).unwrap()
        router.push(`/admin/courses/${result.data.id}/edit`)
      }
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: { message?: string; details?: { field: string; issue: string }[] } } }
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
        <h2 className="text-lg font-semibold">{isEdit ? "Edit course" : "New course"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
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
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input id="thumbnail" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
          </div>
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Modules & lessons</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setModules((m) => [...m, newModule(m.length)])}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add module
          </Button>
        </div>

        {modules.map((mod, mi) => (
          <div key={mod.key} className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <Label>Module {mi + 1} title</Label>
                <Input
                  value={mod.title}
                  onChange={(e) =>
                    setModules((mods) =>
                      mods.map((m, i) => (i === mi ? { ...m, title: e.target.value } : m)),
                    )
                  }
                  required
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-8 shrink-0"
                disabled={modules.length === 1}
                onClick={() => setModules((mods) => mods.filter((_, i) => i !== mi))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {mod.lessons.map((lesson, li) => (
              <div key={lesson.key} className="ml-2 space-y-2 rounded-lg border border-dashed p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lesson {li + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={mod.lessons.length === 1}
                    onClick={() =>
                      setModules((mods) =>
                        mods.map((m, i) =>
                          i === mi
                            ? { ...m, lessons: m.lessons.filter((_, j) => j !== li) }
                            : m,
                        ),
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
                <Input
                  placeholder="Lesson title"
                  value={lesson.title}
                  onChange={(e) =>
                    setModules((mods) =>
                      mods.map((m, i) =>
                        i === mi
                          ? {
                              ...m,
                              lessons: m.lessons.map((l, j) =>
                                j === li ? { ...l, title: e.target.value } : l,
                              ),
                            }
                          : m,
                      ),
                    )
                  }
                  required
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Select
                    value={lesson.type}
                    onValueChange={(v) =>
                      setModules((mods) =>
                        mods.map((m, i) =>
                          i === mi
                            ? {
                                ...m,
                                lessons: m.lessons.map((l, j) =>
                                  j === li ? { ...l, type: v as LessonType } : l,
                                ),
                              }
                            : m,
                        ),
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(LessonType).map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Duration (seconds)"
                    value={lesson.durationS ?? ""}
                    onChange={(e) =>
                      setModules((mods) =>
                        mods.map((m, i) =>
                          i === mi
                            ? {
                                ...m,
                                lessons: m.lessons.map((l, j) =>
                                  j === li
                                    ? {
                                        ...l,
                                        durationS: e.target.value
                                          ? Number(e.target.value)
                                          : null,
                                      }
                                    : l,
                                ),
                              }
                            : m,
                        ),
                      )
                    }
                  />
                </div>
                <Input
                  placeholder="Video URL"
                  value={lesson.videoUrl ?? ""}
                  onChange={(e) =>
                    setModules((mods) =>
                      mods.map((m, i) =>
                        i === mi
                          ? {
                              ...m,
                              lessons: m.lessons.map((l, j) =>
                                j === li ? { ...l, videoUrl: e.target.value } : l,
                              ),
                            }
                          : m,
                      ),
                    )
                  }
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`preview-${mod.key}-${lesson.key}`}
                    checked={lesson.isPreview}
                    onCheckedChange={(v) =>
                      setModules((mods) =>
                        mods.map((m, i) =>
                          i === mi
                            ? {
                                ...m,
                                lessons: m.lessons.map((l, j) =>
                                  j === li ? { ...l, isPreview: v === true } : l,
                                ),
                              }
                            : m,
                        ),
                      )
                    }
                  />
                  <Label htmlFor={`preview-${mod.key}-${lesson.key}`}>
                    Preview lesson (guests can play)
                  </Label>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setModules((mods) =>
                  mods.map((m, i) =>
                    i === mi ? { ...m, lessons: [...m.lessons, newLesson(m.lessons.length)] } : m,
                  ),
                )
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Add lesson
            </Button>
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save course"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/courses")}>
          Back to list
        </Button>
      </div>
    </form>
  )
}
