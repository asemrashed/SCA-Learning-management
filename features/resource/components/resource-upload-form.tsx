"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MediaSourceField } from "@/components/media-source-field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CurriculumPlacementPicker,
  type CurriculumPlacement,
} from "@/components/curriculum-placement-picker"
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import { resolvePlacementIds } from "@/lib/placement-ids"
import { useCreateResourceMutation } from "@/features/resource/api"

const initialPlacement: CurriculumPlacement = {
  scope: "batch",
  subjectId: null,
  moduleId: null,
  lessonId: null,
}

interface ResourceUploadFormProps {
  fixedBatchId?: string
  fixedCourseId?: string
  onSuccess?: () => void
  inModal?: boolean
}

export function ResourceUploadForm({
  fixedBatchId,
  fixedCourseId,
  onSuccess,
  inModal = false,
}: ResourceUploadFormProps) {
  const [title, setTitle] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [fileType, setFileType] = useState<"pdf" | "slide" | "link">("pdf")
  const [placement, setPlacement] = useState<CurriculumPlacement>({
    ...initialPlacement,
    scope: fixedCourseId ? "course" : "batch",
    batchId: fixedBatchId,
    courseId: fixedCourseId,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [createResource, { isLoading }] = useCreateResourceMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const { batchId, courseId, error: placementError } = resolvePlacementIds(placement)
    if (placementError) {
      setError(placementError)
      return
    }

    if (courseId && !placement.moduleId && !placement.lessonId) {
      setError("Course resources need a module or lesson.")
      return
    }

    if (!fileUrl.trim()) {
      setError("Add a file via upload or paste a link.")
      return
    }

    try {
      await createResource({
        title,
        fileUrl,
        fileType,
        ...(batchId
          ? {
              batchId,
              moduleId: placement.moduleId ?? null,
              lessonId: placement.lessonId ?? null,
            }
          : {
              courseId,
              moduleId: placement.moduleId ?? undefined,
              lessonId: placement.lessonId ?? undefined,
            }),
      }).unwrap()
      setTitle("")
      setFileUrl("")
      setPlacement({
        ...initialPlacement,
        scope: placement.scope,
        batchId: fixedBatchId ?? batchId,
        courseId: fixedCourseId ?? courseId,
      })
      setSuccess("Resource saved.")
      onSuccess?.()
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create resource. Check fields and try again."))
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={inModal ? "space-y-6" : "space-y-6 rounded-xl border bg-card p-6"}
    >
      {!inModal ? (
        <>
          <h2 className="text-lg font-semibold">Add resource</h2>
          <p className="text-sm text-muted-foreground">
            Add notes, past papers, or question files via upload or external link.
          </p>
        </>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="resource-title">Title</Label>
          <Input
            id="resource-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <MediaSourceField
            label="File"
            value={fileUrl}
            onChange={setFileUrl}
            folder="documents"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,application/pdf,application/msword,image/*"
            placeholder="https://…"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-1">
          <Label>File type</Label>
          <Select value={fileType} onValueChange={(v) => setFileType(v as typeof fileType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF / Notes</SelectItem>
              <SelectItem value="slide">Slides</SelectItem>
              <SelectItem value="link">External link</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CurriculumPlacementPicker
          className="contents"
          value={placement}
          onChange={setPlacement}
          fixedBatchId={fixedBatchId}
          fixedCourseId={fixedCourseId}
          showScopeToggle={!fixedBatchId && !fixedCourseId}
          moduleLabel={
            placement.scope === "course" ? "Module (required if no lesson)" : "Module (optional)"
          }
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-green-700">{success}</p> : null}

      <Button type="submit" disabled={isLoading} className="rounded-xl">
        {isLoading ? "Saving…" : "Save resource"}
      </Button>
    </form>
  )
}
