"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MediaSourceField } from "@/components/media-source-field"
import { SecurePdfViewer } from "@/components/secure-pdf-viewer"
import { useListBatchesByCourseQuery, useListBatchesQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"
import {
  useListAdminResourceSubmissionsQuery,
  useUploadResourceSubmissionResultMutation,
} from "@/features/resource-submission/api"
import { getApiErrorMessage } from "@/lib/get-api-error-message"
import { DeliveryMode, ResourceCategory, ResourceSubmissionStatus } from "@/types/api"

interface ResultsPanelProps {
  category: ResourceCategory.EXAM | ResourceCategory.ASSIGNMENT
  backHref: string
  title: string
}

export function ResultsPanel({ category, backHref, title }: ResultsPanelProps) {
  const [courseId, setCourseId] = useState("")
  const [batchId, setBatchId] = useState("")
  const [search, setSearch] = useState("")
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null)
  const [resultFileUrl, setResultFileUrl] = useState("")
  const [previewSubmissionId, setPreviewSubmissionId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: coursesData } = useListCoursesQuery({ deliveryMode: DeliveryMode.LIVE, pageSize: 100 })
  const { data: batchesData } = useListBatchesQuery({ pageSize: 100 })
  const { data: courseBatchesData } = useListBatchesByCourseQuery(courseId, { skip: !courseId })

  const queryParams = useMemo(
    () => ({
      category,
      status: ResourceSubmissionStatus.ACCEPTED,
      courseId: courseId || undefined,
      batchId: batchId || undefined,
      search: search.trim() || undefined,
      pageSize: 50,
    }),
    [category, courseId, batchId, search],
  )

  const { data, isLoading, error, refetch } = useListAdminResourceSubmissionsQuery(queryParams)
  const [uploadResult, { isLoading: uploading }] = useUploadResourceSubmissionResultMutation()

  const submissions = data?.data ?? []
  const batchOptions = courseId
    ? (courseBatchesData?.data ?? [])
    : (batchesData?.data ?? [])

  useEffect(() => {
    setBatchId("")
  }, [courseId])

  async function handleUpload() {
    if (!uploadTargetId || !resultFileUrl.trim()) {
      setActionError("Upload a result PDF first.")
      return
    }
    setActionError(null)
    try {
      await uploadResult({
        id: uploadTargetId,
        body: { resultFileUrl },
      }).unwrap()
      setUploadTargetId(null)
      setResultFileUrl("")
      void refetch()
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not upload result."))
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild className="rounded-xl">
        <Link href={backHref}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
      </Button>

      <p className="text-sm text-muted-foreground">
        Upload result PDFs for accepted {title.toLowerCase()} submissions. Students see published
        results on their course result page.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-between">
        <Select value={courseId || "__all__"} onValueChange={(v) => setCourseId(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-full sm:flex-1 lg:max-w-[220px]">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All courses</SelectItem>
            {(coursesData?.data ?? []).map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={batchId || "__all__"} onValueChange={(v) => setBatchId(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-full sm:flex-1 lg:max-w-[220px]">
            <SelectValue placeholder="Batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All batches</SelectItem>
            {batchOptions.map((batch) => (
              <SelectItem key={batch.id} value={batch.id}>
                {batch.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          className="w-full sm:flex-1 lg:max-w-xs"
          placeholder="Search student or title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">Loading accepted submissions…</p>
        ) : error ? (
          <p className="px-5 py-8 text-sm text-destructive">Could not load submissions.</p>
        ) : submissions.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No accepted submissions yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">{title}</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Result</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.student.rollNumber ?? item.student.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3">{item.resource.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.resource.subjectTitle ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {item.resultPublishedAt ? (
                        <Badge>Published</Badge>
                      ) : (
                        <Badge variant="secondary">Not uploaded</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => {
                            setUploadTargetId(item.id)
                            setResultFileUrl(item.resultFileUrl ?? "")
                            setActionError(null)
                          }}
                        >
                          <Upload className="mr-1 h-4 w-4" />
                          {item.resultPublishedAt ? "Replace" : "Upload"}
                        </Button>
                        {item.resultPublishedAt ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => setPreviewSubmissionId(item.id)}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={Boolean(uploadTargetId)} onOpenChange={(open) => !open && setUploadTargetId(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload result PDF</DialogTitle>
            <DialogDescription>
              This result will appear on the student&apos;s course result page.
            </DialogDescription>
          </DialogHeader>
          <MediaSourceField
            label="Result PDF"
            value={resultFileUrl}
            onChange={setResultFileUrl}
            folder="documents"
            accept=".pdf,application/pdf"
            placeholder="Upload or paste URL"
          />
          <Button className="rounded-xl" disabled={uploading} onClick={() => void handleUpload()}>
            {uploading ? "Publishing…" : "Publish result"}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewSubmissionId)} onOpenChange={(open) => !open && setPreviewSubmissionId(null)}>
        <DialogContent showCloseButton={false} className="max-h-[95vh] max-w-5xl gap-0 overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Result preview</DialogTitle>
          </DialogHeader>
          {previewSubmissionId ? (
            <SecurePdfViewer
              submissionId={previewSubmissionId}
              submissionStream="admin"
              title="Result"
              onClose={() => setPreviewSubmissionId(null)}
              className="min-h-[80vh] rounded-none border-0"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
