"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CopyLessonPicker,
  CopyModulePicker,
  CopySubjectPicker,
} from "@/features/course/components/copy-from-batch-picker"
import {
  LessonTypeFields,
  LIVE_COURSE_LESSON_TYPES,
} from "@/features/course/components/lesson-type-fields"
import { CHAPTER } from "@/lib/product-vocabulary"
import type { LessonForm, ModuleForm, SubjectForm } from "./curriculum-editor"
import { newLesson, newModule, newSubject } from "./curriculum-editor"

export type LiveCurriculumModal =
  | { kind: "subject"; mode: "add" | "edit"; subjectIndex?: number }
  | { kind: "module"; mode: "add" | "edit"; subjectIndex: number; moduleIndex?: number }
  | {
      kind: "lesson"
      mode: "add" | "edit"
      subjectIndex: number
      moduleIndex: number
      lessonIndex?: number
    }
  | null

interface LiveCurriculumModalsProps {
  modal: LiveCurriculumModal
  onClose: () => void
  subjects: SubjectForm[]
  onSave: (subjects: SubjectForm[]) => void
  showPreBatchCurriculum: boolean
  sourceBatchId: string
}

export function LiveCurriculumModals({
  modal,
  onClose,
  subjects,
  onSave,
  showPreBatchCurriculum,
  sourceBatchId,
}: LiveCurriculumModalsProps) {
  const [draftSubject, setDraftSubject] = useState<SubjectForm>(newSubject(0))
  const [draftModule, setDraftModule] = useState<ModuleForm>(newModule(0))
  const [draftLesson, setDraftLesson] = useState<LessonForm>(newLesson(0))
  const [copyPick, setCopyPick] = useState("")

  useEffect(() => {
    if (!modal) return
    setCopyPick("")
    if (modal.kind === "subject") {
      if (modal.mode === "edit" && modal.subjectIndex !== undefined) {
        setDraftSubject({ ...subjects[modal.subjectIndex] })
      } else {
        setDraftSubject(newSubject(subjects.length))
      }
    } else if (modal.kind === "module") {
      const subject = subjects[modal.subjectIndex]
      if (modal.mode === "edit" && modal.moduleIndex !== undefined) {
        setDraftModule({ ...subject.modules[modal.moduleIndex] })
      } else {
        setDraftModule({ ...newModule(subject.modules.length), lessons: [] })
      }
    } else if (modal.kind === "lesson") {
      const mod = subjects[modal.subjectIndex].modules[modal.moduleIndex]
      if (modal.mode === "edit" && modal.lessonIndex !== undefined) {
        setDraftLesson({ ...mod.lessons[modal.lessonIndex] })
      } else {
        setDraftLesson(newLesson(mod.lessons.length))
      }
    }
  }, [modal, subjects])

  if (!modal) return null

  function handleSave() {
    if (modal?.kind === "subject") {
      const next = [...subjects]
      if (modal.mode === "edit" && modal.subjectIndex !== undefined) {
        next[modal.subjectIndex] = { ...draftSubject, title: draftSubject.title.trim() }
      } else {
        next.push({ ...draftSubject, title: draftSubject.title.trim(), order: next.length })
      }
      onSave(next)
    } else if (modal?.kind === "module") {
      const next = subjects.map((s, si) => {
        if (si !== modal.subjectIndex) return s
        const modules = [...s.modules]
        if (modal.mode === "edit" && modal.moduleIndex !== undefined) {
          modules[modal.moduleIndex] = { ...draftModule, title: draftModule.title.trim() }
        } else {
          modules.push({
            ...draftModule,
            title: draftModule.title.trim(),
            order: modules.length,
            lessons: [],
          })
        }
        return { ...s, modules }
      })
      onSave(next)
    } else if (modal?.kind === "lesson") {
      const next = subjects.map((s, si) => {
        if (si !== modal.subjectIndex) return s
        return {
          ...s,
          modules: s.modules.map((m, mi) => {
            if (mi !== modal.moduleIndex) return m
            const lessons = [...m.lessons]
            if (modal.mode === "edit" && modal.lessonIndex !== undefined) {
              lessons[modal.lessonIndex] = draftLesson
            } else {
              lessons.push({ ...draftLesson, order: lessons.length })
            }
            return { ...m, lessons }
          }),
        }
      })
      onSave(next)
    }
    onClose()
  }

  const contextSubjectTitle =
    modal.kind === "module"
      ? subjects[modal.subjectIndex]?.title ?? draftSubject.title
      : modal.kind === "lesson"
        ? subjects[modal.subjectIndex]?.title ?? ""
        : ""

  const contextModuleTitle =
    modal.kind === "lesson"
      ? subjects[modal.subjectIndex]?.modules[modal.moduleIndex]?.title ?? draftModule.title
      : ""

  const title =
    modal.kind === "subject"
      ? modal.mode === "edit"
        ? "Edit subject"
        : "Add subject"
      : modal.kind === "module"
        ? modal.mode === "edit"
          ? `Edit ${CHAPTER.toLowerCase()}`
          : `Add ${CHAPTER.toLowerCase()}`
        : modal.mode === "edit"
          ? "Edit lesson"
          : "Add lesson"

  const canSave =
    modal.kind === "subject"
      ? draftSubject.title.trim().length > 0
      : modal.kind === "module"
        ? draftModule.title.trim().length > 0
        : draftLesson.title.trim().length > 0

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={modal.kind === "lesson" ? "sm:max-w-2xl" : "sm:max-w-lg"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {modal.kind === "subject" ? (
            <>
              {showPreBatchCurriculum && sourceBatchId ? (
                <CopySubjectPicker
                  sourceBatchId={sourceBatchId}
                  value={copyPick}
                  onChange={(_id, t) => {
                    setCopyPick(_id)
                    setDraftSubject((prev) => ({ ...prev, title: t }))
                  }}
                />
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="subject-title">Subject title</Label>
                <Input
                  id="subject-title"
                  value={draftSubject.title}
                  onChange={(e) => setDraftSubject((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>
            </>
          ) : null}

          {modal.kind === "module" ? (
            <>
              {showPreBatchCurriculum && sourceBatchId ? (
                <CopyModulePicker
                  sourceBatchId={sourceBatchId}
                  contextSubjectTitle={contextSubjectTitle}
                  value={copyPick}
                  onChange={(_id, t) => {
                    setCopyPick(_id)
                    setDraftModule((prev) => ({ ...prev, title: t }))
                  }}
                />
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="module-title">{CHAPTER} title</Label>
                <Input
                  id="module-title"
                  value={draftModule.title}
                  onChange={(e) => setDraftModule((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>
            </>
          ) : null}

          {modal.kind === "lesson" ? (
            <>
              {showPreBatchCurriculum && sourceBatchId ? (
                <CopyLessonPicker
                  sourceBatchId={sourceBatchId}
                  contextSubjectTitle={contextSubjectTitle}
                  contextModuleTitle={contextModuleTitle}
                  value={copyPick}
                  onChange={(fields) => {
                    setCopyPick("picked")
                    setDraftLesson((prev) => ({ ...prev, ...fields }))
                  }}
                />
              ) : null}
              <LessonFormFields lesson={draftLesson} onChange={setDraftLesson} />
            </>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={!canSave} onClick={handleSave}>
            {modal.mode === "edit" ? "Save" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function LessonFormFields({
  lesson,
  onChange,
}: {
  lesson: LessonForm
  onChange: (lesson: LessonForm) => void
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="lesson-title">Lesson title</Label>
        <Input
          id="lesson-title"
          value={lesson.title}
          onChange={(e) => onChange({ ...lesson, title: e.target.value })}
          required
        />
      </div>
      <LessonTypeFields
        lesson={lesson}
        onChange={onChange}
        lessonTypes={LIVE_COURSE_LESSON_TYPES}
        showLectureDate
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
