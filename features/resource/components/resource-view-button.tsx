"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SecurePdfViewer } from "@/components/secure-pdf-viewer"
import type { ResourceItem } from "@/types/api"

interface ResourceViewButtonProps {
  resource: Pick<ResourceItem, "id" | "title" | "fileUrl" | "fileType">
  variant?: "default" | "outline"
  size?: "default" | "sm" | "icon"
  className?: string
}

export function ResourceViewDialog({
  resource,
  open,
  onOpenChange,
}: {
  resource: Pick<ResourceItem, "id" | "title" | "fileUrl" | "fileType">
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[95vh] max-w-5xl gap-0 overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{resource.title}</DialogTitle>
        </DialogHeader>
        <SecurePdfViewer
          resourceId={resource.id}
          title={resource.title}
          onClose={() => onOpenChange(false)}
          className="min-h-[80vh] rounded-none border-0"
        />
      </DialogContent>
    </Dialog>
  )
}

export function openResourceExternally(
  resource: Pick<ResourceItem, "fileUrl" | "fileType">,
) {
  if (resource.fileType === "link" && resource.fileUrl) {
    window.open(resource.fileUrl, "_blank", "noopener,noreferrer")
    return true
  }
  return false
}

export function ResourceViewButton({
  resource,
  variant = "outline",
  size = "sm",
  className,
}: ResourceViewButtonProps) {
  const [open, setOpen] = useState(false)
  const isLink = resource.fileType === "link"

  if (isLink && resource.fileUrl) {
    return (
      <Button variant={variant} size={size} className={className} asChild>
        <Link href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
          <Eye className="mr-1 h-4 w-4" />
          Open
        </Link>
      </Button>
    )
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Eye className="mr-1 h-4 w-4" />
        View
      </Button>
      <ResourceViewDialog resource={resource} open={open} onOpenChange={setOpen} />
    </>
  )
}
