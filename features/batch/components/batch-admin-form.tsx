"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ExternalLink, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CompactMediaSourceField, MediaSourceField } from "@/components/media-source-field"
import {
  useCreateBatchMutation,
  useGetBatchQuery,
  useUpdateBatchMutation,
} from "@/features/batch/api"
import type {
  BatchInputSubject,
  BatchStatus,
  CreateBatchInput,
  LessonType,
} from "@/features/batch/types"
import { BATCH_STATUS_LABEL } from "@/features/batch/utils"

const BATCH_STATUSES: BatchStatus[] = [
  "DRAFT",
  "UPCOMING",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]

const LESSON_TYPES: LessonType[] = ["VIDEO", "LIVE", "TEXT", "DOCUMENT"]

interface LessonForm {
  key: string
  title: string
  type: LessonType
  videoUrl: string
  durationS: number | null
  isPreview: boolean
}

interface ModuleForm {
  key: string
  title: string
  lessons: LessonForm[]
}

interface SubjectForm {
  key: string
  title: string
  modules: ModuleForm[]
}

let nextFormKey = 0
function formKey(prefix: string): string {
  nextFormKey += 1
  return `${prefix}-${nextFormKey}`
}

function newLesson(): LessonForm {
  return {
    key: formKey("lesson"),
    title: "",
    type: "VIDEO",
    videoUrl: "",
    durationS: null,
    isPreview: false,
  }
}

function newModule(): ModuleForm {
  return {
    key: formKey("module"),
    title: "",
    lessons: [newLesson()],
  }
}

function newSubject(): SubjectForm {
  return {
    key: formKey("subject"),
    title: "",
    modules: [newModule()],
  }
}

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

function subjectsFromBatch(subjects: CreateBatchInput["subjects"]): SubjectForm[] {
  if (!subjects?.length) return [newSubject()]
  return subjects.map((subject) => ({
    key: formKey("subject"),
    title: subject.title,
    modules: (subject.modules?.length ? subject.modules : [{ title: "", order: 0, lessons: [] }]).map(
      (mod) => ({
      key: formKey("module"),
      title: mod.title,
      lessons: (mod.lessons?.length ? mod.lessons : [{ title: "", order: 0 }]).map((lesson) => ({
        key: formKey("lesson"),
        title: lesson.title,
        type: lesson.type ?? "VIDEO",
        videoUrl: lesson.videoUrl ?? "",
        durationS: lesson.durationS ?? null,
        isPreview: lesson.isPreview ?? false,
      })),
    }),
    ),
  }))
}

function toSubjectsPayload(subjects: SubjectForm[]): BatchInputSubject[] {
  return subjects.map((subject, si) => ({
    title: subject.title,
    order: si,
    modules: subject.modules.map((mod, mi) => ({
      title: mod.title,
      order: mi,
      lessons: mod.lessons.map((lesson, li) => ({
        title: lesson.title,
        type: lesson.type,
        order: li,
        isPreview: lesson.isPreview,
        videoUrl: lesson.videoUrl.trim() || null,
        durationS: lesson.durationS ? Number(lesson.durationS) : null,
      })),
    })),
  }))
}

interface BatchAdminFormProps {
  batchId?: string
}

export function BatchAdminForm({ batchId }: BatchAdminFormProps) {
  const router = useRouter()
  const isEdit = Boolean(batchId)
  const { data, isLoading } = useGetBatchQuery(batchId!, { skip: !batchId })
  const [createBatch, { isLoading: creating }] = useCreateBatchMutation()
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
  const [instructorIds, setInstructorIds] = useState("")
  const [subjects, setSubjects] = useState<SubjectForm[]>([])
  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0)
  const [activeModuleIndex, setActiveModuleIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit && subjects.length === 0) {
      setSubjects([newSubject()])
    }
  }, [isEdit, subjects.length])

  useEffect(() => {
    if (!data?.data) return
    const b = data.data
    setTitle(b.title)
    setSlug(b.slug)
    setSlugTouched(true)
    setStatus(b.status)
    setThumbnail(b.thumbnail ?? "")
    setPriceMajor(String(b.priceMinor / 100))
    setCapacity(b.capacity != null ? String(b.capacity) : "")
    setRegistrationDeadline(toDatetimeLocal(b.registrationDeadline))
    setStartDate(toDatetimeLocal(b.startDate))
    setEndDate(toDatetimeLocal(b.endDate))
    setInstructorIds(b.instructors.map((i) => i.id).join(", "))
    setSubjects(
      subjectsFromBatch(
        b.subjects.map((s) => ({
          title: s.title,
          order: s.order,
          modules: s.modules.map((m) => ({
            title: m.title,
            order: m.order,
            lessons: m.lessons.map((l) => ({
              title: l.title,
              type: l.type,
              order: l.order,
              isPreview: l.isPreview,
              videoUrl: l.videoUrl,
              durationS: l.durationS,
            })),
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

  useEffect(() => {
    if (activeSubjectIndex >= subjects.length && subjects.length > 0) {
      setActiveSubjectIndex(subjects.length - 1)
    }
  }, [subjects.length, activeSubjectIndex])

  useEffect(() => {
    const modCount = subjects[activeSubjectIndex]?.modules.length ?? 0
    if (activeModuleIndex >= modCount && modCount > 0) {
      setActiveModuleIndex(modCount - 1)
    }
  }, [subjects, activeSubjectIndex, activeModuleIndex])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsedInstructors = instructorIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)

    const body: CreateBatchInput = {
      title: title.trim(),
      slug: slug.trim(),
      status,
      thumbnail: thumbnail.trim() || null,
      priceMinor: Math.round(parseFloat(priceMajor || "0") * 100),
      capacity: capacity.trim() ? Number(capacity) : null,
      registrationDeadline: fromDatetimeLocal(registrationDeadline),
      startDate: fromDatetimeLocal(startDate),
      endDate: fromDatetimeLocal(endDate),
      instructorIds: parsedInstructors.length ? parsedInstructors : undefined,
      subjects: toSubjectsPayload(subjects),
    }

    try {
      if (isEdit && batchId) {
        await updateBatch({ id: batchId, body }).unwrap()
        router.refresh()
      } else {
        const result = await createBatch(body).unwrap()
        router.push(`/admin/batches/${result.data.id}/edit`)
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
    return <p className="text-muted-foreground">Loading batch…</p>
  }

  const saving = creating || updating
  const publicSlug = data?.data?.slug ?? slug

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-4 rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit batch" : "New batch"}</h2>
          {isEdit && publicSlug ? (
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href={`/batches/${publicSlug}`} target="_blank">
                <ExternalLink className="mr-1 h-4 w-4" />
                View public page
              </Link>
            </Button>
          ) : null}
        </div>

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
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as BatchStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BATCH_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {BATCH_STATUS_LABEL[s] ?? s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label htmlFor="endDate">End date</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="instructors">Instructor user IDs</Label>
            <Input
              id="instructors"
              placeholder="cuid1, cuid2 (comma-separated)"
              value={instructorIds}
              onChange={(e) => setInstructorIds(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Must be existing INSTRUCTOR or ADMIN user IDs from the database.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Subjects, modules & lessons</h2>
            <p className="text-sm text-muted-foreground">
              Select a subject and module from the dropdowns — no long scrolling.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSubjects((s) => [...s, newSubject()])
              setActiveSubjectIndex(subjects.length)
              setActiveModuleIndex(0)
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add subject
          </Button>
        </div>

        {subjects.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select
                  value={String(activeSubjectIndex)}
                  onValueChange={(v) => {
                    setActiveSubjectIndex(Number(v))
                    setActiveModuleIndex(0)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject, si) => (
                      <SelectItem key={subject.key} value={String(si)}>
                        {subject.title.trim() || `Subject ${si + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Module</Label>
                <Select
                  value={String(activeModuleIndex)}
                  onValueChange={(v) => setActiveModuleIndex(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(subjects[activeSubjectIndex]?.modules ?? []).map((mod, mi) => (
                      <SelectItem key={mod.key} value={String(mi)}>
                        {mod.title.trim() || `Module ${mi + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(() => {
              const si = activeSubjectIndex
              const mi = activeModuleIndex
              const subject = subjects[si]
              const mod = subject?.modules[mi]
              if (!subject || !mod) return null

              return (
                <div className="space-y-4 rounded-lg border-2 border-primary/20 p-4">
                  <div className="flex flex-wrap items-start gap-2">
                    <div className="min-w-[200px] flex-1 space-y-2">
                      <Label>Subject title</Label>
                      <Input
                        value={subject.title}
                        onChange={(e) =>
                          setSubjects((subs) =>
                            subs.map((s, i) =>
                              i === si ? { ...s, title: e.target.value } : s,
                            ),
                          )
                        }
                        placeholder="e.g. Programming"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-8"
                      disabled={subjects.length === 1}
                      onClick={() => {
                        setSubjects((subs) => subs.filter((_, i) => i !== si))
                        setActiveSubjectIndex(Math.max(0, si - 1))
                        setActiveModuleIndex(0)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-start gap-2">
                    <div className="min-w-[200px] flex-1 space-y-2">
                      <Label>Module title</Label>
                      <Input
                        value={mod.title}
                        onChange={(e) =>
                          setSubjects((subs) =>
                            subs.map((s, i) =>
                              i === si
                                ? {
                                    ...s,
                                    modules: s.modules.map((m, j) =>
                                      j === mi ? { ...m, title: e.target.value } : m,
                                    ),
                                  }
                                : s,
                            ),
                          )
                        }
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-8"
                      onClick={() =>
                        setSubjects((subs) =>
                          subs.map((s, i) =>
                            i === si ? { ...s, modules: [...s.modules, newModule()] } : s,
                          ),
                        )
                      }
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add module
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-8"
                      disabled={subject.modules.length === 1}
                      onClick={() => {
                        setSubjects((subs) =>
                          subs.map((s, i) =>
                            i === si
                              ? { ...s, modules: s.modules.filter((_, j) => j !== mi) }
                              : s,
                          ),
                        )
                        setActiveModuleIndex(Math.max(0, mi - 1))
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Label>Lessons in this module</Label>
                    {mod.lessons.map((lesson, li) => (
                      <div
                        key={lesson.key}
                        className="space-y-2 rounded-lg border border-dashed bg-background p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            Lesson {li + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={mod.lessons.length === 1}
                            onClick={() =>
                              setSubjects((subs) =>
                                subs.map((s, i) =>
                                  i === si
                                    ? {
                                        ...s,
                                        modules: s.modules.map((m, j) =>
                                          j === mi
                                            ? {
                                                ...m,
                                                lessons: m.lessons.filter((_, k) => k !== li),
                                              }
                                            : m,
                                        ),
                                      }
                                    : s,
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
                            setSubjects((subs) =>
                              subs.map((s, i) =>
                                i === si
                                  ? {
                                      ...s,
                                      modules: s.modules.map((m, j) =>
                                        j === mi
                                          ? {
                                              ...m,
                                              lessons: m.lessons.map((l, k) =>
                                                k === li ? { ...l, title: e.target.value } : l,
                                              ),
                                            }
                                          : m,
                                      ),
                                    }
                                  : s,
                              ),
                            )
                          }
                          required
                        />
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Select
                            value={lesson.type}
                            onValueChange={(v) =>
                              setSubjects((subs) =>
                                subs.map((s, i) =>
                                  i === si
                                    ? {
                                        ...s,
                                        modules: s.modules.map((m, j) =>
                                          j === mi
                                            ? {
                                                ...m,
                                                lessons: m.lessons.map((l, k) =>
                                                  k === li ? { ...l, type: v as LessonType } : l,
                                                ),
                                              }
                                            : m,
                                        ),
                                      }
                                    : s,
                                ),
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LESSON_TYPES.map((t) => (
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
                              setSubjects((subs) =>
                                subs.map((s, i) =>
                                  i === si
                                    ? {
                                        ...s,
                                        modules: s.modules.map((m, j) =>
                                          j === mi
                                            ? {
                                                ...m,
                                                lessons: m.lessons.map((l, k) =>
                                                  k === li
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
                                      }
                                    : s,
                                ),
                              )
                            }
                          />
                        </div>
                        <CompactMediaSourceField
                          label="Video"
                          value={lesson.videoUrl}
                          onChange={(url) =>
                            setSubjects((subs) =>
                              subs.map((s, i) =>
                                i === si
                                  ? {
                                      ...s,
                                      modules: s.modules.map((m, j) =>
                                        j === mi
                                          ? {
                                              ...m,
                                              lessons: m.lessons.map((l, k) =>
                                                k === li ? { ...l, videoUrl: url } : l,
                                              ),
                                            }
                                          : m,
                                      ),
                                    }
                                  : s,
                              ),
                            )
                          }
                          folder="videos"
                          accept="video/*"
                          placeholder="Video URL or YouTube link"
                        />
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`preview-${subject.key}-${mod.key}-${lesson.key}`}
                            checked={lesson.isPreview}
                            onCheckedChange={(v) =>
                              setSubjects((subs) =>
                                subs.map((s, i) =>
                                  i === si
                                    ? {
                                        ...s,
                                        modules: s.modules.map((m, j) =>
                                          j === mi
                                            ? {
                                                ...m,
                                                lessons: m.lessons.map((l, k) =>
                                                  k === li ? { ...l, isPreview: v === true } : l,
                                                ),
                                              }
                                            : m,
                                        ),
                                      }
                                    : s,
                                ),
                              )
                            }
                          />
                          <Label htmlFor={`preview-${subject.key}-${mod.key}-${lesson.key}`}>
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
                        setSubjects((subs) =>
                          subs.map((s, i) =>
                            i === si
                              ? {
                                  ...s,
                                  modules: s.modules.map((m, j) =>
                                    j === mi ? { ...m, lessons: [...m.lessons, newLesson()] } : m,
                                  ),
                                }
                              : s,
                          ),
                        )
                      }
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add lesson
                    </Button>
                  </div>
                </div>
              )
            })()}
          </>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save batch"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/batches")}>
          Back to list
        </Button>
      </div>
    </form>
  )
}
