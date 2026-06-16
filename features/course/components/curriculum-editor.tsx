"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
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
import { CompactMediaSourceField } from "@/components/media-source-field"
import { CHAPTER, CHAPTERS, LESSON_TYPE_LABEL } from "@/lib/product-vocabulary"
import { LessonType } from "@/types/api"

const LESSON_TYPES: LessonType[] = [
  LessonType.RECORDED,
  LessonType.LIVE,
  LessonType.TEXT,
  LessonType.DOCUMENT,
]

export interface LessonForm {
  key: string
  title: string
  type: LessonType
  videoUrl: string
  content: string
  durationS: number | null
  order: number
  isPreview: boolean
}

export interface ModuleForm {
  key: string
  title: string
  order: number
  lessons: LessonForm[]
}

export interface SubjectForm {
  key: string
  title: string
  order: number
  modules: ModuleForm[]
}

let nextFormKey = 0
export function formKey(prefix: string): string {
  nextFormKey += 1
  return `${prefix}-${nextFormKey}`
}

export function newLesson(order: number): LessonForm {
  return {
    key: formKey("lesson"),
    title: "",
    type: LessonType.RECORDED,
    order,
    isPreview: false,
    videoUrl: "",
    content: "",
    durationS: null,
  }
}

export function newModule(order: number): ModuleForm {
  return {
    key: formKey("module"),
    title: "",
    order,
    lessons: [newLesson(0)],
  }
}

export function newSubject(order: number): SubjectForm {
  return {
    key: formKey("subject"),
    title: "",
    order,
    modules: [newModule(0)],
  }
}

interface SubjectsEditorProps {
  subjects: SubjectForm[]
  onChange: (subjects: SubjectForm[]) => void
}

export function SubjectsEditor({ subjects, onChange }: SubjectsEditorProps) {
  const [activeSubjectIndex, setActiveSubjectIndex] = useStateSafe(
    subjects.length > 0 ? 0 : 0,
  )
  const [activeModuleIndex, setActiveModuleIndex] = useStateSafe(0)

  const subject = subjects[activeSubjectIndex]
  const mod = subject?.modules[activeModuleIndex]

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Subjects, {CHAPTERS.toLowerCase()} & lessons</h2>
          <p className="text-sm text-muted-foreground">
            Live course curriculum — Subject → {CHAPTER} → Lesson
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            onChange([...subjects, newSubject(subjects.length)])
            setActiveSubjectIndex(subjects.length)
            setActiveModuleIndex(0)
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add subject
        </Button>
      </div>

      {subjects.length > 0 && subject && mod ? (
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
                  {subjects.map((s, si) => (
                    <SelectItem key={s.key} value={String(si)}>
                      {s.title.trim() || `Subject ${si + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{CHAPTER}</Label>
              <Select
                value={String(activeModuleIndex)}
                onValueChange={(v) => setActiveModuleIndex(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subject.modules.map((m, mi) => (
                    <SelectItem key={m.key} value={String(mi)}>
                      {m.title.trim() || `${CHAPTER} ${mi + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border-2 border-primary/20 p-4">
            <div className="flex flex-wrap items-start gap-2">
              <div className="min-w-[200px] flex-1 space-y-2">
                <Label>Subject title</Label>
                <Input
                  value={subject.title}
                  onChange={(e) =>
                    onChange(
                      subjects.map((s, i) =>
                        i === activeSubjectIndex ? { ...s, title: e.target.value } : s,
                      ),
                    )
                  }
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
                  onChange(subjects.filter((_, i) => i !== activeSubjectIndex))
                  setActiveSubjectIndex(Math.max(0, activeSubjectIndex - 1))
                  setActiveModuleIndex(0)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap items-start gap-2">
              <div className="min-w-[200px] flex-1 space-y-2">
                <Label>{CHAPTER} title</Label>
                <Input
                  value={mod.title}
                  onChange={(e) =>
                    onChange(
                      subjects.map((s, si) =>
                        si === activeSubjectIndex
                          ? {
                              ...s,
                              modules: s.modules.map((m, mi) =>
                                mi === activeModuleIndex ? { ...m, title: e.target.value } : m,
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
                  onChange(
                    subjects.map((s, si) =>
                      si === activeSubjectIndex
                        ? { ...s, modules: [...s.modules, newModule(s.modules.length)] }
                        : s,
                    ),
                  )
                }
              >
                <Plus className="mr-1 h-4 w-4" />
                Add {CHAPTER.toLowerCase()}
              </Button>
            </div>

            <div className="space-y-3">
              <Label>Lessons</Label>
              {mod.lessons.map((lesson, li) => (
                <LessonRow
                  key={lesson.key}
                  lesson={lesson}
                  onChange={(next) =>
                    onChange(
                      subjects.map((s, si) =>
                        si === activeSubjectIndex
                          ? {
                              ...s,
                              modules: s.modules.map((m, mi) =>
                                mi === activeModuleIndex
                                  ? {
                                      ...m,
                                      lessons: m.lessons.map((l, k) => (k === li ? next : l)),
                                    }
                                  : m,
                              ),
                            }
                          : s,
                      ),
                    )
                  }
                  onRemove={() =>
                    onChange(
                      subjects.map((s, si) =>
                        si === activeSubjectIndex
                          ? {
                              ...s,
                              modules: s.modules.map((m, mi) =>
                                mi === activeModuleIndex
                                  ? { ...m, lessons: m.lessons.filter((_, k) => k !== li) }
                                  : m,
                              ),
                            }
                          : s,
                      ),
                    )
                  }
                  canRemove={mod.lessons.length > 1}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onChange(
                    subjects.map((s, si) =>
                      si === activeSubjectIndex
                        ? {
                            ...s,
                            modules: s.modules.map((m, mi) =>
                              mi === activeModuleIndex
                                ? { ...m, lessons: [...m.lessons, newLesson(m.lessons.length)] }
                                : m,
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
        </>
      ) : null}
    </div>
  )
}

interface ModulesEditorProps {
  modules: ModuleForm[]
  onChange: (modules: ModuleForm[]) => void
}

export function ModulesEditor({ modules, onChange }: ModulesEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{CHAPTERS} & lessons</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...modules, newModule(modules.length)])}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add {CHAPTER.toLowerCase()}
        </Button>
      </div>

      {modules.map((mod, mi) => (
        <div key={mod.key} className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <Label>{CHAPTER} {mi + 1} title</Label>
              <Input
                value={mod.title}
                onChange={(e) =>
                  onChange(modules.map((m, i) => (i === mi ? { ...m, title: e.target.value } : m)))
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
              onClick={() => onChange(modules.filter((_, i) => i !== mi))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {mod.lessons.map((lesson, li) => (
            <LessonRow
              key={lesson.key}
              lesson={lesson}
              onChange={(next) =>
                onChange(
                  modules.map((m, i) =>
                    i === mi
                      ? { ...m, lessons: m.lessons.map((l, j) => (j === li ? next : l)) }
                      : m,
                  ),
                )
              }
              onRemove={() =>
                onChange(
                  modules.map((m, i) =>
                    i === mi ? { ...m, lessons: m.lessons.filter((_, j) => j !== li) } : m,
                  ),
                )
              }
              canRemove={mod.lessons.length > 1}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange(
                modules.map((m, i) =>
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
  )
}

function LessonRow({
  lesson,
  onChange,
  onRemove,
  canRemove,
}: {
  lesson: LessonForm
  onChange: (lesson: LessonForm) => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <div className="space-y-2 rounded-lg border border-dashed p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Lesson</span>
        <Button type="button" variant="ghost" size="sm" disabled={!canRemove} onClick={onRemove}>
          Remove
        </Button>
      </div>
      <Input
        placeholder="Lesson title"
        value={lesson.title}
        onChange={(e) => onChange({ ...lesson, title: e.target.value })}
        required
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <Select
          value={lesson.type}
          onValueChange={(v) => onChange({ ...lesson, type: v as LessonType })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LESSON_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {LESSON_TYPE_LABEL[t] ?? t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Duration (seconds)"
          value={lesson.durationS ?? ""}
          onChange={(e) =>
            onChange({
              ...lesson,
              durationS: e.target.value ? Number(e.target.value) : null,
            })
          }
        />
      </div>
      <CompactMediaSourceField
        label="Video"
        value={lesson.videoUrl}
        onChange={(url) => onChange({ ...lesson, videoUrl: url })}
        folder="videos"
        accept="video/*"
        placeholder="Video URL or YouTube link"
      />
      <div className="flex items-center gap-2">
        <Checkbox
          id={`preview-${lesson.key}`}
          checked={lesson.isPreview}
          onCheckedChange={(v) => onChange({ ...lesson, isPreview: v === true })}
        />
        <Label htmlFor={`preview-${lesson.key}`}>Preview lesson (guests can play)</Label>
      </div>
    </div>
  )
}

function useStateSafe(initial: number): [number, (n: number) => void] {
  const [value, setValue] = useState(initial)
  return [value, setValue]
}

export function subjectsToPayload(subjects: SubjectForm[]) {
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
        content: lesson.content.trim() || null,
        durationS: lesson.durationS ? Number(lesson.durationS) : null,
      })),
    })),
  }))
}

export function modulesToPayload(modules: ModuleForm[]) {
  return modules.map((mod, mi) => ({
    title: mod.title,
    order: mi,
    lessons: mod.lessons.map((lesson, li) => ({
      title: lesson.title,
      type: lesson.type,
      order: li,
      isPreview: lesson.isPreview,
      videoUrl: lesson.videoUrl.trim() || null,
      content: lesson.content.trim() || null,
      durationS: lesson.durationS ? Number(lesson.durationS) : null,
    })),
  }))
}

export function subjectsFromApi(
  subjects: { title: string; order: number; modules: { title: string; order: number; lessons: { title: string; type?: LessonType; order?: number; isPreview?: boolean; videoUrl?: string | null; content?: string | null; durationS?: number | null }[] }[] }[],
): SubjectForm[] {
  if (!subjects.length) return [newSubject(0)]
  return subjects.map((subject) => ({
    key: formKey("subject"),
    title: subject.title,
    order: subject.order,
    modules: (subject.modules?.length ? subject.modules : [{ title: "", order: 0, lessons: [] }]).map(
      (mod) => ({
        key: formKey("module"),
        title: mod.title,
        order: mod.order,
        lessons: (mod.lessons?.length ? mod.lessons : [{ title: "", order: 0 }]).map((lesson) => ({
          key: formKey("lesson"),
          title: lesson.title,
          type: lesson.type ?? LessonType.RECORDED,
          order: lesson.order ?? 0,
          isPreview: lesson.isPreview ?? false,
          videoUrl: lesson.videoUrl ?? "",
          content: lesson.content ?? "",
          durationS: lesson.durationS ?? null,
        })),
      }),
    ),
  }))
}

export function modulesFromApi(
  modules: { title: string; order: number; lessons: { title: string; type?: LessonType; order?: number; isPreview?: boolean; videoUrl?: string | null; content?: string | null; durationS?: number | null }[] }[],
): ModuleForm[] {
  if (!modules.length) return [newModule(0)]
  return modules.map((mod) => ({
    key: formKey("module"),
    title: mod.title,
    order: mod.order,
    lessons: (mod.lessons ?? []).map((lesson) => ({
      key: formKey("lesson"),
      title: lesson.title,
      type: lesson.type ?? LessonType.RECORDED,
      order: lesson.order ?? 0,
      isPreview: lesson.isPreview ?? false,
      videoUrl: lesson.videoUrl ?? "",
      content: lesson.content ?? "",
      durationS: lesson.durationS ?? null,
    })),
  }))
}
