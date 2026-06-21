"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/native-select"
import { MediaSourceField } from "@/components/media-source-field"
import { BATCH_STATUS_LABEL } from "@/features/batch/utils"
import type { BatchStatus } from "@/features/batch/types"
import { BATCH } from "@/lib/product-vocabulary"

const BATCH_STATUSES: BatchStatus[] = [
  "DRAFT",
  "UPCOMING",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]

export interface InitialBatchFormState {
  title: string
  status: BatchStatus
  thumbnail: string
  priceMajor: string
  capacity: string
  registrationDeadline: string
  startDate: string
  endDate: string
}

export function emptyInitialBatchState(): InitialBatchFormState {
  return {
    title: "",
    status: "DRAFT",
    thumbnail: "",
    priceMajor: "0",
    capacity: "",
    registrationDeadline: "",
    startDate: "",
    endDate: "",
  }
}

interface InitialBatchFieldsProps {
  value: InitialBatchFormState
  onChange: (next: InitialBatchFormState) => void
}

export function InitialBatchFields({ value, onChange }: InitialBatchFieldsProps) {
  function patch(partial: Partial<InitialBatchFormState>) {
    onChange({ ...value, ...partial })
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div>
        <h3 className="text-base font-semibold">First {BATCH.toLowerCase()}</h3>
        <p className="text-sm text-muted-foreground">
          Live courses need at least one batch before subjects, chapters, and lessons can be saved.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="batch-title">Cohort title</Label>
          <Input
            id="batch-title"
            value={value.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="e.g. BBA 2026"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="batch-status">Status</Label>
          <NativeSelect
            id="batch-status"
            value={value.status}
            onChange={(e) => patch({ status: e.target.value as BatchStatus })}
          >
            {BATCH_STATUSES.map((s) => (
              <option key={s} value={s}>
                {BATCH_STATUS_LABEL[s] ?? s}
              </option>
            ))}
          </NativeSelect>
        </div>
        <MediaSourceField
          label="Thumbnail"
          value={value.thumbnail}
          onChange={(thumbnail) => patch({ thumbnail })}
          folder="images"
          accept="image/*"
          placeholder="https://…"
        />
        <div className="space-y-2">
          <Label htmlFor="batch-price">Enrollment price (৳)</Label>
          <Input
            id="batch-price"
            type="number"
            min="0"
            step="1"
            value={value.priceMajor}
            onChange={(e) => patch({ priceMajor: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="batch-capacity">Capacity (seats)</Label>
          <Input
            id="batch-capacity"
            type="number"
            min="1"
            placeholder="Optional"
            value={value.capacity}
            onChange={(e) => patch({ capacity: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="batch-registrationDeadline">Registration deadline (optional)</Label>
          <Input
            id="batch-registrationDeadline"
            type="datetime-local"
            value={value.registrationDeadline}
            onChange={(e) => patch({ registrationDeadline: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="batch-startDate">Start date</Label>
          <Input
            id="batch-startDate"
            type="datetime-local"
            value={value.startDate}
            onChange={(e) => patch({ startDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="batch-endDate">End date (optional)</Label>
          <Input
            id="batch-endDate"
            type="datetime-local"
            value={value.endDate}
            onChange={(e) => patch({ endDate: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
