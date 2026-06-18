"use client"

import { BatchLiveClassScheduleManager } from "@/features/liveclass/components/batch-live-class-schedule-manager"

export function BatchSessionManager({ batchId, batchTitle }: { batchId: string; batchTitle: string }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">{batchTitle}</h2>
        <p className="text-sm text-muted-foreground">Schedule and manage live classes</p>
      </div>

      <BatchLiveClassScheduleManager batchId={batchId} />
    </div>
  )
}
