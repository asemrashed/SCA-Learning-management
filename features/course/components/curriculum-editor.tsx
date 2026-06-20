"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  LiveCurriculumModals,
  type LiveCurriculumModal,
} from "@/features/course/components/live-curriculum-modals"
import {
  LessonTypeFields,
  RECORDED_COURSE_LESSON_TYPES,
} from "@/features/course/components/lesson-type-fields"
import { CHAPTER, CHAPTERS } from "@/lib/product-vocabulary"
import { LessonType } from "@/types/api"

export interface LessonForm {
  key: string
  title: string
  type: LessonType
  videoUrl: string
  content: string
  durationS: number | null
  lectureDate: string
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
    lectureDate: "",
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
  showPreBatchCurriculum?: boolean
  sourceBatchId?: string
}

export function SubjectsEditor({
  subjects,
  onChange,
  showPreBatchCurriculum = false,
  sourceBatchId = "",
}: SubjectsEditorProps) {
  const [modal, setModal] = useState<LiveCurriculumModal>(null)

  function openModal(next: LiveCurriculumModal) {
    setModal(next)
  }

  function removeSubject(index: number) {
    onChange(subjects.filter((_, i) => i !== index))
  }

  function removeModule(subjectIndex: number, moduleIndex: number) {
    onChange(
      subjects.map((s, si) =>
        si === subjectIndex
          ? { ...s, modules: s.modules.filter((_, mi) => mi !== moduleIndex) }
          : s,
      ),
    )
  }

  function removeLesson(subjectIndex: number, moduleIndex: number, lessonIndex: number) {
    onChange(
      subjects.map((s, si) =>
        si === subjectIndex
          ? {
              ...s,
              modules: s.modules.map((m, mi) =>
                mi === moduleIndex
                  ? { ...m, lessons: m.lessons.filter((_, li) => li !== lessonIndex) }
                  : m,
              ),
            }
          : s,
      ),
    )
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Subjects, {CHAPTERS.toLowerCase()} & lessons</h2>
          <p className="text-sm text-muted-foreground">
            Subject → {CHAPTER} → Lesson
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => openModal({ kind: "subject", mode: "add" })}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add subject
        </Button>
      </div>

      {subjects.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No subjects yet. Click &quot;Add subject&quot; to start building this batch curriculum.
        </p>
      ) : (
        <div className="space-y-4">
          {subjects.map((subject, si) => (
            <div key={subject.key} className="rounded-lg border p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{subject.title.trim() || `Subject ${si + 1}`}</h3>
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal({ kind: "subject", mode: "edit", subjectIndex: si })}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubject(si)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openModal({ kind: "module", mode: "add", subjectIndex: si })}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add {CHAPTER.toLowerCase()}
                  </Button>
                </div>
              </div>

              {subject.modules.length === 0 ? (
                <p className="text-sm text-muted-foreground">No chapters yet.</p>
              ) : (
                <div className="space-y-3 border-l-2 border-muted pl-4">
                  {subject.modules.map((mod, mi) => (
                    <div key={mod.key} className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {mod.title.trim() || `${CHAPTER} ${mi + 1}`}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              openModal({
                                kind: "module",
                                mode: "edit",
                                subjectIndex: si,
                                moduleIndex: mi,
                              })
                            }
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeModule(si, mi)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openModal({
                                kind: "lesson",
                                mode: "add",
                                subjectIndex: si,
                                moduleIndex: mi,
                              })
                            }
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Lesson
                          </Button>
                        </div>
                      </div>

                      {mod.lessons.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No lessons yet.</p>
                      ) : (
                        <ul className="space-y-1 border-l border-dashed pl-3">
                          {mod.lessons.map((lesson, li) => (
                            <li
                              key={lesson.key}
                              className="flex flex-wrap items-center justify-between gap-2 text-sm"
                            >
                              <span>{lesson.title.trim() || `Lesson ${li + 1}`}</span>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    openModal({
                                      kind: "lesson",
                                      mode: "edit",
                                      subjectIndex: si,
                                      moduleIndex: mi,
                                      lessonIndex: li,
                                    })
                                  }
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => removeLesson(si, mi, li)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <LiveCurriculumModals
        modal={modal}
        onClose={() => setModal(null)}
        subjects={subjects}
        onSave={onChange}
        showPreBatchCurriculum={showPreBatchCurriculum}
        sourceBatchId={sourceBatchId}
      />
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
              showLectureDate
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
  showLectureDate = false,
}: {
  lesson: LessonForm
  onChange: (lesson: LessonForm) => void
  onRemove: () => void
  canRemove: boolean
  showLectureDate?: boolean
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
      <LessonTypeFields
        lesson={lesson}
        onChange={onChange}
        lessonTypes={RECORDED_COURSE_LESSON_TYPES}
        showLectureDate={showLectureDate}
        idPrefix={lesson.key}
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
        ...(lesson.lectureDate.trim()
          ? { lectureDate: lesson.lectureDate.trim() }
          : {}),
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
      ...(lesson.lectureDate.trim()
        ? { lectureDate: lesson.lectureDate.trim() }
        : {}),
    })),
  }))
}

export function subjectsFromApi(
  subjects: {
    title: string
    order: number
    modules?: {
      title: string
      order: number
      lessons?: {
        title: string
        type?: LessonType
        order?: number
        isPreview?: boolean
        videoUrl?: string | null
        content?: string | null
        durationS?: number | null
        lectureDate?: string | null
      }[]
    }[]
  }[],
): SubjectForm[] {
  if (!subjects.length) return []
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
          lectureDate: lesson.lectureDate ?? "",
        })),
      }),
    ),
  }))
}

export function modulesFromApi(
  modules: { title: string; order: number; lessons: { title: string; type?: LessonType; order?: number; isPreview?: boolean; videoUrl?: string | null; content?: string | null; durationS?: number | null; lectureDate?: string | null }[] }[],
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
      lectureDate: lesson.lectureDate ?? "",
    })),
  }))
}
