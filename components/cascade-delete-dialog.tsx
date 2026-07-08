'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type CascadeDeletePreview = {
  resources: number
  subjects: number
  modules: number
  lessons: number
  enrollments: number
}

interface CascadeDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  targetLabel: string
  preview: CascadeDeletePreview | null
  loadingPreview?: boolean
  confirming?: boolean
  error?: string | null
  onConfirm: () => void
}

export function CascadeDeleteDialog({
  open,
  onOpenChange,
  title,
  targetLabel,
  preview,
  loadingPreview,
  confirming,
  error,
  onConfirm,
}: CascadeDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                You are about to permanently delete <strong className="text-foreground">{targetLabel}</strong>.
              </p>
              <p className="font-medium text-destructive">
                All classes and resources under this item will be deleted. This cannot be undone.
              </p>
              {loadingPreview ? (
                <p>Counting related data…</p>
              ) : preview ? (
                <ul className="list-inside list-disc space-y-1 rounded-md border bg-muted/40 p-3 text-foreground">
                  <li>{preview.resources} resource(s) (lecture sheets, PDFs, etc.)</li>
                  {preview.subjects > 0 ? <li>{preview.subjects} subject(s)</li> : null}
                  {preview.modules > 0 ? <li>{preview.modules} chapter(s)</li> : null}
                  {preview.lessons > 0 ? <li>{preview.lessons} lesson(s)</li> : null}
                  {preview.enrollments > 0 ? (
                    <li>{preview.enrollments} enrollment(s)</li>
                  ) : null}
                </ul>
              ) : null}
              {error ? <p className="text-destructive">{error}</p> : null}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={confirming}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: 'destructive' }))}
            disabled={confirming || loadingPreview}
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
          >
            {confirming ? 'Deleting…' : 'Confirm Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** Local confirm state helper for list pages. */
export function useCascadeDeleteDialog() {
  const [open, setOpen] = useState(false)
  return { open, setOpen }
}
