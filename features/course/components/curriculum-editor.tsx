"use client"

import { useState } from "react"
import { ChevronDown, Plus, Pencil, Trash2 } from "lucide-react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  CopyLessonPicker,
  CopyModulePicker,
  type CurriculumCopySource,
} from "@/features/course/components/copy-from-batch-picker"
import {
  LiveCurriculumModals,
  type LiveCurriculumModal,
} from "@/features/course/components/live-curriculum-modals"
import {
  LessonTypeFields,
  RECORDED_COURSE_LESSON_TYPES,
} from "@/features/course/components/lesson-type-fields"
import {
  CascadeDeleteDialog,
  type CascadeDeletePreview,
} from "@/components/cascade-delete-dialog"
import {
  useCascadeDeleteLessonMutation,
  useCascadeDeleteModuleMutation,
  useCascadeDeleteSubjectMutation,
  useCreateCourseModuleMutation,
  useLazyGetCascadeDeletePreviewQuery,
  useUpdateCourseModuleMutation,
} from "@/features/curriculum/api"
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import { isSuperAdmin } from "@/lib/roles"
import type { RootState } from "@/store"
import { CHAPTER, CHAPTERS } from "@/lib/product-vocabulary"
import { LessonType } from "@/types/api"

export interface LessonForm {
  key: string
  id?: string
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
  id?: string
  title: string
  order: number
  lessons: LessonForm[]
}

export interface SubjectForm {
  key: string
  id?: string
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
    lessons: [],
  }
}

export function newSubject(order: number): SubjectForm {
  return {
    key: formKey("subject"),
    title: "",
    order,
    modules: [],
  }
}

function subjectLabel(subject: SubjectForm, index: number): string {
  return subject.title.trim() || `Subject ${index + 1}`
}

function moduleLabel(mod: ModuleForm, index: number): string {
  return mod.title.trim() || `${CHAPTER} ${index + 1}`
}

interface SubjectsEditorProps {
  subjects: SubjectForm[]
  onChange: (subjects: SubjectForm[]) => void
  showPreBatchCurriculum?: boolean
  sourceBatchId?: string
  batchId?: string
  onCurriculumPersisted?: () => void
}

export function SubjectsEditor({
  subjects,
  onChange,
  showPreBatchCurriculum = false,
  sourceBatchId = "",
  batchId,
  onCurriculumPersisted,
}: SubjectsEditorProps) {
  const user = useSelector((state: RootState) => state.auth.user)
  const canCascadeDelete = user?.role !== undefined && isSuperAdmin(user.role)
  const [modal, setModal] = useState<LiveCurriculumModal>(null)
  const [pendingDelete, setPendingDelete] = useState<
    | { kind: "subject"; index: number; id: string; title: string }
    | { kind: "module"; subjectIndex: number; moduleIndex: number; id: string; title: string }
    | {
        kind: "lesson"
        subjectIndex: number
        moduleIndex: number
        lessonIndex: number
        id: string
        title: string
      }
    | null
  >(null)
  const [preview, setPreview] = useState<CascadeDeletePreview | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [fetchPreview, { isFetching: loadingPreview }] = useLazyGetCascadeDeletePreviewQuery()
  const [deleteSubjectApi, { isLoading: deletingSubject }] = useCascadeDeleteSubjectMutation()
  const [deleteModuleApi, { isLoading: deletingModule }] = useCascadeDeleteModuleMutation()
  const [deleteLessonApi, { isLoading: deletingLesson }] = useCascadeDeleteLessonMutation()
  const [expandedSubjectKeys, setExpandedSubjectKeys] = useState<Set<string>>(new Set())

  function openModal(next: LiveCurriculumModal) {
    setModal(next)
  }

  function toggleSubject(key: string) {
    setExpandedSubjectKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function subjectMeta(subject: SubjectForm): string {
    const chapterCount = subject.modules.length
    const lessonCount = subject.modules.reduce((n, m) => n + m.lessons.length, 0)
    return `${chapterCount} ${chapterCount === 1 ? CHAPTER.toLowerCase() : CHAPTERS.toLowerCase()} · ${lessonCount} lesson${lessonCount === 1 ? "" : "s"}`
  }

  /** Unsaved draft rows can be dropped from the form; persisted rows need Super Admin cascade. */
  function removeSubject(index: number) {
    const subject = subjects[index]
    if (!subject) return
    if (!subject.id) {
      onChange(subjects.filter((_, i) => i !== index))
      return
    }
    if (!canCascadeDelete) return
    void openCascadeDelete({
      kind: "subject",
      index,
      id: subject.id,
      title: subject.title.trim() || "this subject",
    })
  }

  function removeModule(subjectIndex: number, moduleIndex: number) {
    const mod = subjects[subjectIndex]?.modules[moduleIndex]
    if (!mod) return
    if (!mod.id) {
      onChange(
        subjects.map((s, si) =>
          si === subjectIndex
            ? { ...s, modules: s.modules.filter((_, mi) => mi !== moduleIndex) }
            : s,
        ),
      )
      return
    }
    if (!canCascadeDelete) return
    void openCascadeDelete({
      kind: "module",
      subjectIndex,
      moduleIndex,
      id: mod.id,
      title: mod.title.trim() || "this chapter",
    })
  }

  async function openCascadeDelete(
    target:
      | { kind: "subject"; index: number; id: string; title: string }
      | { kind: "module"; subjectIndex: number; moduleIndex: number; id: string; title: string }
      | {
          kind: "lesson"
          subjectIndex: number
          moduleIndex: number
          lessonIndex: number
          id: string
          title: string
        },
  ) {
    setDeleteError(null)
    setPreview(null)
    setPendingDelete(target)
    try {
      const previewParams =
        target.kind === "subject"
          ? { subjectId: target.id }
          : target.kind === "module"
            ? { moduleId: target.id }
            : { lessonId: target.id }
      const result = await fetchPreview(previewParams).unwrap()
      setPreview(result.data)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, "Could not load delete preview."))
    }
  }

  async function confirmCascadeDelete() {
    if (!pendingDelete) return
    setDeleteError(null)
    try {
      if (pendingDelete.kind === "subject") {
        await deleteSubjectApi(pendingDelete.id).unwrap()
        onChange(subjects.filter((_, i) => i !== pendingDelete.index))
      } else if (pendingDelete.kind === "module") {
        await deleteModuleApi(pendingDelete.id).unwrap()
        onChange(
          subjects.map((s, si) =>
            si === pendingDelete.subjectIndex
              ? {
                  ...s,
                  modules: s.modules.filter((_, mi) => mi !== pendingDelete.moduleIndex),
                }
              : s,
          ),
        )
      } else {
        await deleteLessonApi(pendingDelete.id).unwrap()
        onChange(
          subjects.map((s, si) =>
            si === pendingDelete.subjectIndex
              ? {
                  ...s,
                  modules: s.modules.map((m, mi) =>
                    mi === pendingDelete.moduleIndex
                      ? {
                          ...m,
                          lessons: m.lessons.filter((_, li) => li !== pendingDelete.lessonIndex),
                        }
                      : m,
                  ),
                }
              : s,
          ),
        )
      }
      onCurriculumPersisted?.()
      setPendingDelete(null)
      setPreview(null)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, "Could not delete."))
    }
  }

  function removeLesson(subjectIndex: number, moduleIndex: number, lessonIndex: number) {
    const lesson = subjects[subjectIndex]?.modules[moduleIndex]?.lessons[lessonIndex]
    if (!lesson) return
    if (!lesson.id) {
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
      return
    }
    if (!canCascadeDelete) return
    void openCascadeDelete({
      kind: "lesson",
      subjectIndex,
      moduleIndex,
      lessonIndex,
      id: lesson.id,
      title: lesson.title.trim() || "this lesson",
    })
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Subjects, {CHAPTERS.toLowerCase()} & lessons</h2>
          <p className="text-sm text-muted-foreground">
            Subject → {CHAPTER} → Lesson. Chapters can be saved without lessons so you can attach
            lecture sheets and suggestions first.
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
        <div className="space-y-3">
          {subjects.map((subject, si) => {
            const expanded = expandedSubjectKeys.has(subject.key)
            return (
              <div key={subject.key} className="rounded-lg border bg-muted/20">
                <div
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-2 px-4 py-3",
                    expanded && "border-b",
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => toggleSubject(subject.key)}
                    aria-expanded={expanded}
                  >
                    <h3 className="font-semibold">{subjectLabel(subject, si)}</h3>
                    <p className="text-sm text-muted-foreground">{subjectMeta(subject)}</p>
                  </button>
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        openModal({ kind: "subject", mode: "edit", subjectIndex: si })
                      }
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubject(si)}
                      hidden={Boolean(subject.id) && !canCascadeDelete}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Delete
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setExpandedSubjectKeys((prev) => new Set(prev).add(subject.key))
                        openModal({ kind: "module", mode: "add", subjectIndex: si })
                      }}
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Add {CHAPTER.toLowerCase()}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => toggleSubject(subject.key)}
                      aria-label={expanded ? "Collapse subject" : "Expand subject"}
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expanded && "rotate-180",
                        )}
                      />
                    </Button>
                  </div>
                </div>

                {expanded ? (
                  <div className="space-y-3 px-4 py-3">
                    {subject.modules.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No chapters yet.</p>
                    ) : (
                      <div className="space-y-3 border-l-2 border-muted pl-4">
                        {subject.modules.map((mod, mi) => (
                          <div key={mod.key} className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-medium">{moduleLabel(mod, mi)}</p>
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
                                  hidden={Boolean(mod.id) && !canCascadeDelete}
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
                                        hidden={Boolean(lesson.id) && !canCascadeDelete}
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
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      <LiveCurriculumModals
        modal={modal}
        onClose={() => setModal(null)}
        subjects={subjects}
        onSave={onChange}
        showPreBatchCurriculum={showPreBatchCurriculum}
        sourceBatchId={sourceBatchId}
        batchId={batchId}
        onPersisted={onCurriculumPersisted}
      />

      <CascadeDeleteDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null)
            setPreview(null)
            setDeleteError(null)
          }
        }}
        title={
          pendingDelete?.kind === "subject"
            ? "Delete subject permanently?"
            : pendingDelete?.kind === "module"
              ? "Delete chapter permanently?"
              : "Delete lesson permanently?"
        }
        targetLabel={pendingDelete?.title ?? "this item"}
        preview={preview}
        loadingPreview={loadingPreview}
        confirming={deletingSubject || deletingModule || deletingLesson}
        error={deleteError}
        onConfirm={() => void confirmCascadeDelete()}
      />
    </div>
  )
}

interface ModulesEditorProps {
  modules: ModuleForm[]
  onChange: (modules: ModuleForm[]) => void
  showPreviousCurriculum?: boolean
  copySource?: CurriculumCopySource
  courseId?: string
  onCurriculumPersisted?: () => void
}

export function ModulesEditor({
  modules,
  onChange,
  showPreviousCurriculum = false,
  copySource,
  courseId,
  onCurriculumPersisted,
}: ModulesEditorProps) {
  const user = useSelector((state: RootState) => state.auth.user)
  const canCascadeDelete = user?.role !== undefined && isSuperAdmin(user.role)
  const [moduleCopyPick, setModuleCopyPick] = useState<Record<string, string>>({})
  const [lessonCopyPick, setLessonCopyPick] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savingModuleKey, setSavingModuleKey] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<
    | { kind: "module"; index: number; id: string; title: string }
    | { kind: "lesson"; moduleIndex: number; lessonIndex: number; id: string; title: string }
    | null
  >(null)
  const [preview, setPreview] = useState<CascadeDeletePreview | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [fetchPreview, { isFetching: loadingPreview }] = useLazyGetCascadeDeletePreviewQuery()
  const [deleteModuleApi, { isLoading: deletingModule }] = useCascadeDeleteModuleMutation()
  const [deleteLessonApi, { isLoading: deletingLesson }] = useCascadeDeleteLessonMutation()
  const [createModuleApi, { isLoading: creatingModule }] = useCreateCourseModuleMutation()
  const [updateModuleApi] = useUpdateCourseModuleMutation()

  const canCopy = showPreviousCurriculum && Boolean(copySource?.batchId || copySource?.courseId)

  async function handleAddChapter() {
    if (!courseId) {
      const next = newModule(modules.length)
      onChange([...modules, next])
      return
    }
    setSaveError(null)
    try {
      const result = await createModuleApi({
        courseId,
        body: { title: `${CHAPTER} ${modules.length + 1}`, order: modules.length },
      }).unwrap()
      onChange([
        ...modules,
        {
          key: result.data.id,
          id: result.data.id,
          title: result.data.title,
          order: result.data.order,
          lessons: [],
        },
      ])
      onCurriculumPersisted?.()
    } catch (err) {
      setSaveError(getApiErrorMessage(err, `Could not create ${CHAPTER.toLowerCase()}.`))
    }
  }

  async function saveModule(mod: ModuleForm, mi: number) {
    if (!courseId || !mod.id) return
    setSaveError(null)
    setSavingModuleKey(mod.key)
    try {
      await updateModuleApi({
        courseId,
        moduleId: mod.id,
        body: {
          title: mod.title.trim(),
          order: mi,
          lessons: mod.lessons
            .filter((lesson) => lesson.title.trim())
            .map((lesson, li) => lessonToPayload(lesson, li)),
        },
      }).unwrap()
      onCurriculumPersisted?.()
    } catch (err) {
      setSaveError(getApiErrorMessage(err, `Could not save ${CHAPTER.toLowerCase()}.`))
    } finally {
      setSavingModuleKey(null)
    }
  }

  async function openCascadeDelete(
    target:
      | { kind: "module"; index: number; id: string; title: string }
      | { kind: "lesson"; moduleIndex: number; lessonIndex: number; id: string; title: string },
  ) {
    setDeleteError(null)
    setPreview(null)
    setPendingDelete(target)
    try {
      const result = await fetchPreview(
        target.kind === "module" ? { moduleId: target.id } : { lessonId: target.id },
      ).unwrap()
      setPreview(result.data)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, "Could not load delete preview."))
    }
  }

  async function confirmCascadeDelete() {
    if (!pendingDelete) return
    setDeleteError(null)
    try {
      if (pendingDelete.kind === "module") {
        await deleteModuleApi(pendingDelete.id).unwrap()
        onChange(modules.filter((_, i) => i !== pendingDelete.index))
      } else {
        await deleteLessonApi(pendingDelete.id).unwrap()
        onChange(
          modules.map((m, mi) =>
            mi === pendingDelete.moduleIndex
              ? {
                  ...m,
                  lessons: m.lessons.filter((_, li) => li !== pendingDelete.lessonIndex),
                }
              : m,
          ),
        )
      }
      onCurriculumPersisted?.()
      setPendingDelete(null)
      setPreview(null)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, "Could not delete."))
    }
  }

  function removeModule(index: number) {
    const mod = modules[index]
    if (!mod) return
    if (!mod.id) {
      onChange(modules.filter((_, i) => i !== index))
      return
    }
    if (!canCascadeDelete) return
    void openCascadeDelete({
      kind: "module",
      index,
      id: mod.id,
      title: mod.title.trim() || `this ${CHAPTER.toLowerCase()}`,
    })
  }

  function removeLesson(moduleIndex: number, lessonIndex: number) {
    const lesson = modules[moduleIndex]?.lessons[lessonIndex]
    if (!lesson) return
    if (!lesson.id) {
      onChange(
        modules.map((m, mi) =>
          mi === moduleIndex
            ? { ...m, lessons: m.lessons.filter((_, li) => li !== lessonIndex) }
            : m,
        ),
      )
      return
    }
    if (!canCascadeDelete) return
    void openCascadeDelete({
      kind: "lesson",
      moduleIndex,
      lessonIndex,
      id: lesson.id,
      title: lesson.title.trim() || "this lesson",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{CHAPTERS} & lessons</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={creatingModule}
          onClick={() => void handleAddChapter()}
        >
          <Plus className="mr-1 h-4 w-4" />
          {creatingModule ? "Adding…" : `Add ${CHAPTER.toLowerCase()}`}
        </Button>
      </div>

      {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}

      {modules.map((mod, mi) => (
        <div key={mod.key} className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              {canCopy && copySource ? (
                <CopyModulePicker
                  source={copySource}
                  value={moduleCopyPick[mod.key] ?? ""}
                  onChange={(id, title) => {
                    setModuleCopyPick((prev) => ({ ...prev, [mod.key]: id }))
                    onChange(modules.map((m, i) => (i === mi ? { ...m, title } : m)))
                  }}
                />
              ) : null}
              <Label>
                {CHAPTER} {mi + 1} title
              </Label>
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
              hidden={Boolean(mod.id) && !canCascadeDelete}
              disabled={!mod.id && modules.length === 1}
              onClick={() => removeModule(mi)}
              title={
                mod.id
                  ? "Permanently delete this chapter"
                  : `Remove draft ${CHAPTER.toLowerCase()}`
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {mod.lessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No lessons yet. You can save this {CHAPTER.toLowerCase()} and attach resources first.
            </p>
          ) : (
            mod.lessons.map((lesson, li) => (
              <LessonRow
                key={lesson.key}
                showLectureDate
                lesson={lesson}
                copySource={canCopy ? copySource : undefined}
                copyPick={lessonCopyPick[lesson.key] ?? ""}
                onCopyPick={(id) =>
                  setLessonCopyPick((prev) => ({ ...prev, [lesson.key]: id }))
                }
                contextModuleTitle={mod.title}
                onChange={(next) =>
                  onChange(
                    modules.map((m, i) =>
                      i === mi
                        ? { ...m, lessons: m.lessons.map((l, j) => (j === li ? next : l)) }
                        : m,
                    ),
                  )
                }
                onRemove={() => removeLesson(mi, li)}
                canRemove={!lesson.id || canCascadeDelete}
              />
            ))
          )}

          <div className="flex flex-wrap gap-2">
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
            {courseId && mod.id ? (
              <Button
                type="button"
                size="sm"
                disabled={!mod.title.trim() || savingModuleKey === mod.key}
                onClick={() => void saveModule(mod, mi)}
              >
                {savingModuleKey === mod.key ? "Saving…" : `Save ${CHAPTER.toLowerCase()}`}
              </Button>
            ) : null}
          </div>
        </div>
      ))}

      <CascadeDeleteDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null)
            setPreview(null)
            setDeleteError(null)
          }
        }}
        title={
          pendingDelete?.kind === "module"
            ? "Delete chapter permanently?"
            : "Delete lesson permanently?"
        }
        targetLabel={pendingDelete?.title ?? "this item"}
        preview={preview}
        loadingPreview={loadingPreview}
        confirming={deletingModule || deletingLesson}
        error={deleteError}
        onConfirm={() => void confirmCascadeDelete()}
      />
    </div>
  )
}

function LessonRow({
  lesson,
  onChange,
  onRemove,
  canRemove,
  showLectureDate = false,
  copySource,
  copyPick = "",
  onCopyPick,
  contextModuleTitle = "",
}: {
  lesson: LessonForm
  onChange: (lesson: LessonForm) => void
  onRemove: () => void
  canRemove: boolean
  showLectureDate?: boolean
  copySource?: CurriculumCopySource
  copyPick?: string
  onCopyPick?: (id: string) => void
  contextModuleTitle?: string
}) {
  return (
    <div className="space-y-2 rounded-lg border border-dashed p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Lesson</span>
        <Button type="button" variant="ghost" size="sm" disabled={!canRemove} onClick={onRemove}>
          Remove
        </Button>
      </div>
      {copySource ? (
        <CopyLessonPicker
          source={copySource}
          contextModuleTitle={contextModuleTitle}
          value={copyPick}
          onChange={(fields) => {
            onCopyPick?.("picked")
            onChange({ ...lesson, ...fields })
          }}
        />
      ) : null}
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

export function lessonToPayload(lesson: LessonForm, order: number) {
  return {
    ...(lesson.id ? { id: lesson.id } : {}),
    title: lesson.title.trim(),
    type: lesson.type,
    order,
    isPreview: lesson.isPreview,
    videoUrl: lesson.videoUrl.trim() || null,
    content: lesson.content.trim() || null,
    durationS:
      lesson.type === LessonType.RECORDED && lesson.durationS
        ? Number(lesson.durationS)
        : null,
    ...(lesson.lectureDate.trim() ? { lectureDate: lesson.lectureDate.trim() } : {}),
  }
}

export function subjectsToPayload(subjects: SubjectForm[]) {
  return subjects
    .filter((subject) => subject.title.trim())
    .map((subject, si) => ({
      ...(subject.id ? { id: subject.id } : {}),
      title: subject.title.trim(),
      order: si,
      modules: subject.modules
        .filter((mod) => mod.title.trim())
        .map((mod, mi) => ({
          ...(mod.id ? { id: mod.id } : {}),
          title: mod.title.trim(),
          order: mi,
          lessons: mod.lessons
            .filter((lesson) => lesson.title.trim())
            .map((lesson, li) => lessonToPayload(lesson, li)),
        })),
    }))
}

export function modulesToPayload(modules: ModuleForm[]) {
  return modules
    .filter((mod) => mod.title.trim())
    .map((mod, mi) => ({
      ...(mod.id ? { id: mod.id } : {}),
      title: mod.title.trim(),
      order: mi,
      lessons: mod.lessons
        .filter((lesson) => lesson.title.trim())
        .map((lesson, li) => lessonToPayload(lesson, li)),
    }))
}

export function subjectsFromApi(
  subjects: {
    id?: string
    title: string
    order: number
    modules?: {
      id?: string
      title: string
      order: number
      lessons?: {
        id?: string
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
    key: subject.id ?? formKey("subject"),
    id: subject.id,
    title: subject.title,
    order: subject.order,
    modules: (subject.modules ?? []).map((mod) => ({
      key: mod.id ?? formKey("module"),
      id: mod.id,
      title: mod.title,
      order: mod.order,
      lessons: (mod.lessons ?? []).map((lesson) => ({
        key: lesson.id ?? formKey("lesson"),
        id: lesson.id,
        title: lesson.title,
        type: lesson.type ?? LessonType.RECORDED,
        order: lesson.order ?? 0,
        isPreview: lesson.isPreview ?? false,
        videoUrl: lesson.videoUrl ?? "",
        content: lesson.content ?? "",
        durationS: lesson.durationS ?? null,
        lectureDate: lesson.lectureDate ?? "",
      })),
    })),
  }))
}

export function modulesFromApi(
  modules: {
    id?: string
    title: string
    order: number
    lessons: {
      id?: string
      title: string
      type?: LessonType
      order?: number
      isPreview?: boolean
      videoUrl?: string | null
      content?: string | null
      durationS?: number | null
      lectureDate?: string | null
    }[]
  }[],
): ModuleForm[] {
  if (!modules.length) return [newModule(0)]
  return modules.map((mod) => ({
    key: mod.id ?? formKey("module"),
    id: mod.id,
    title: mod.title,
    order: mod.order,
    lessons: (mod.lessons ?? []).map((lesson) => ({
      key: lesson.id ?? formKey("lesson"),
      id: lesson.id,
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
