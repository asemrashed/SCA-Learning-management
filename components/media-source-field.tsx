"use client"

import { useId, useState } from "react"
import { Link2, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useUploadFileMutation, type UploadFolder } from "@/features/upload/api"
import { getApiErrorMessage } from "@/lib/get-api-error-message"

export type MediaSourceMode = "upload" | "link"

export interface MediaSourceFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  folder?: UploadFolder
  accept?: string
  placeholder?: string
  required?: boolean
  compact?: boolean
  id?: string
}

export function MediaSourceField({
  label,
  value,
  onChange,
  folder = "files",
  accept,
  placeholder = "https://…",
  required = false,
  compact = false,
  id: idProp,
}: MediaSourceFieldProps) {
  const autoId = useId()
  const fieldId = idProp ?? autoId
  const [mode, setMode] = useState<MediaSourceMode>(value ? "link" : "upload")
  const [uploadFile, { isLoading }] = useUploadFileMutation()
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      const result = await uploadFile({ file, folder }).unwrap()
      onChange(result.data.url)
      setMode("link")
    } catch (err) {
      setError(getApiErrorMessage(err, "Upload failed. Try again or paste a link."))
    } finally {
      e.target.value = ""
    }
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {!compact ? <Label htmlFor={fieldId}>{label}</Label> : null}

      <RadioGroup
        value={mode}
        onValueChange={(v) => setMode(v as MediaSourceMode)}
        className="flex flex-wrap gap-4"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="upload" id={`${fieldId}-upload`} />
          <Label htmlFor={`${fieldId}-upload`} className="cursor-pointer font-normal">
            Upload file
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="link" id={`${fieldId}-link`} />
          <Label htmlFor={`${fieldId}-link`} className="cursor-pointer font-normal">
            Paste link
          </Label>
        </div>
      </RadioGroup>

      {mode === "upload" ? (
        <div className="space-y-2">
          {compact ? <Label htmlFor={fieldId}>{label}</Label> : null}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id={fieldId}
              type="file"
              accept={accept}
              disabled={isLoading}
              onChange={(e) => void handleFileChange(e)}
              className="max-w-md"
            />
            {isLoading ? (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading…
              </span>
            ) : null}
          </div>
          {value ? (
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Link2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{value}</span>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2">
          {compact ? <Label htmlFor={`${fieldId}-url`}>{label}</Label> : null}
          <Input
            id={`${fieldId}-url`}
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required && mode === "link"}
          />
        </div>
      )}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {mode === "upload" && !compact ? (
        <p className="text-xs text-muted-foreground">
          Files are stored on the server (up to 1 GB). Large files may take several minutes to upload.
        </p>
      ) : null}
    </div>
  )
}

/** Compact row: file picker button + optional link toggle for tight form layouts. */
export function CompactMediaSourceField({
  label,
  value,
  onChange,
  folder = "files",
  accept,
  placeholder = "https://…",
}: Omit<MediaSourceFieldProps, "compact" | "required">) {
  const [showLink, setShowLink] = useState(Boolean(value && value.startsWith("http")))
  const [uploadFile, { isLoading }] = useUploadFileMutation()
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      const result = await uploadFile({ file, folder }).unwrap()
      onChange(result.data.url)
      setShowLink(true)
    } catch (err) {
      setError(getApiErrorMessage(err, "Upload failed"))
    } finally {
      e.target.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={isLoading} asChild>
          <label className="cursor-pointer">
            {isLoading ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1 h-3.5 w-3.5" />
            )}
            {label}
            <input
              type="file"
              accept={accept}
              className="sr-only"
              onChange={(e) => void handleFileChange(e)}
            />
          </label>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowLink((s) => !s)}
        >
          {showLink ? "Hide link" : "Paste link"}
        </Button>
      </div>
      {showLink ? (
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : value ? (
        <p className="truncate text-xs text-muted-foreground">{value}</p>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
