"use client"

import { useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MediaSourceField } from "@/components/media-source-field"
import { RichTextEditor } from "@/components/rich-text-editor"
import { LESSON_TYPE_LABEL } from "@/lib/product-vocabulary"
import { LessonType } from "@/types/api"
import type { LessonForm } from "./curriculum-editor"

export const RECORDED_COURSE_LESSON_TYPES: LessonType[] = [
  LessonType.RECORDED,
  LessonType.TEXT,
  LessonType.DOCUMENT,
]

export const LIVE_COURSE_LESSON_TYPES: LessonType[] = [
  LessonType.RECORDED,
  LessonType.LIVE,
  LessonType.TEXT,
  LessonType.DOCUMENT,
]

function durationToHourMinute(seconds: number | null): { hours: string; minutes: string } {
  if (seconds == null || seconds <= 0) return { hours: "", minutes: "" }
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return {
    hours: hours > 0 ? String(hours) : "",
    minutes: String(minutes),
  }
}

function hourMinuteToDuration(hours: string, minutes: string): number | null {
  const hasHours = hours.trim().length > 0
  const hasMinutes = minutes.trim().length > 0
  if (!hasHours && !hasMinutes) return null
  const h = hasHours ? Math.max(0, parseInt(hours, 10) || 0) : 0
  const m = hasMinutes ? Math.min(59, Math.max(0, parseInt(minutes, 10) || 0)) : 0
  const total = h * 3600 + m * 60
  return total > 0 ? total : null
}

interface LessonTypeFieldsProps {
  lesson: LessonForm
  onChange: (lesson: LessonForm) => void
  lessonTypes: LessonType[]
  showLectureDate?: boolean
  idPrefix?: string
}

export function LessonTypeFields({
  lesson,
  onChange,
  lessonTypes,
  showLectureDate = false,
  idPrefix = "lesson",
}: LessonTypeFieldsProps) {
  const { hours, minutes } = durationToHourMinute(lesson.durationS)
  const normalizedTypeRef = useRef(false)

  useEffect(() => {
    if (normalizedTypeRef.current) return
    if (!lessonTypes.includes(lesson.type)) {
      normalizedTypeRef.current = true
      onChange({ ...lesson, type: lessonTypes[0] })
    }
  }, [lesson, lessonTypes, onChange])

  function handleTypeChange(type: LessonType) {
    const next: LessonForm = { ...lesson, type }
    if (type === LessonType.TEXT) {
      next.videoUrl = ""
    } else if (type === LessonType.DOCUMENT) {
      next.content = ""
    } else if (type === LessonType.RECORDED || type === LessonType.LIVE) {
      next.content = ""
    }
    onChange(next)
  }

  function handleDurationChange(part: "hours" | "minutes", value: string) {
    const nextHours = part === "hours" ? value : hours
    const nextMinutes = part === "minutes" ? value : minutes
    onChange({ ...lesson, durationS: hourMinuteToDuration(nextHours, nextMinutes) })
  }

  return (
    <>
      {showLectureDate ? (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-date`}>Date</Label>
          <Input
            id={`${idPrefix}-date`}
            type="date"
            value={lesson.lectureDate}
            onChange={(e) => onChange({ ...lesson, lectureDate: e.target.value })}
          />
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={lesson.type} onValueChange={(v) => handleTypeChange(v as LessonType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lessonTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {LESSON_TYPE_LABEL[t] ?? t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Duration (optional)</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`${idPrefix}-duration-hours`}
              type="number"
              min={0}
              placeholder="0"
              value={hours}
              onChange={(e) => handleDurationChange("hours", e.target.value)}
              aria-label="Hours"
            />
            <span className="text-sm text-muted-foreground">h</span>
            <Input
              id={`${idPrefix}-duration-minutes`}
              type="number"
              min={0}
              max={59}
              placeholder="0"
              value={minutes}
              onChange={(e) => handleDurationChange("minutes", e.target.value)}
              aria-label="Minutes"
            />
            <span className="text-sm text-muted-foreground">m</span>
          </div>
        </div>
      </div>

      {lesson.type === LessonType.RECORDED ? (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-video-url`}>Video link</Label>
          <Input
            id={`${idPrefix}-video-url`}
            type="url"
            value={lesson.videoUrl}
            onChange={(e) => onChange({ ...lesson, videoUrl: e.target.value })}
            placeholder="YouTube or video URL"
          />
        </div>
      ) : null}

      {lesson.type === LessonType.LIVE ? (
        <MediaSourceField
          id={`${idPrefix}-video`}
          label="Video"
          value={lesson.videoUrl}
          onChange={(url) => onChange({ ...lesson, videoUrl: url })}
          folder="videos"
          accept="video/*"
          placeholder="Video URL or YouTube link"
        />
      ) : null}

      {lesson.type === LessonType.TEXT ? (
        <div className="space-y-2">
          <Label>Content</Label>
          <RichTextEditor
            value={lesson.content}
            onChange={(html) => onChange({ ...lesson, content: html })}
            placeholder="Write lesson content…"
          />
        </div>
      ) : null}

      {lesson.type === LessonType.DOCUMENT ? (
        <MediaSourceField
          id={`${idPrefix}-document`}
          label="Document"
          value={lesson.videoUrl}
          onChange={(url) => onChange({ ...lesson, videoUrl: url })}
          folder="files"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,application/pdf"
          placeholder="Document URL"
        />
      ) : null}
    </>
  )
}
