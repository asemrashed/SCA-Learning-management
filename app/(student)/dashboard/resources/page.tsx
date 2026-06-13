"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Role } from "@/types/api"
import { ResourceList } from "@/features/resource/components/resource-list"
import { ResourceManagePanel } from "@/features/resource/components/resource-manage-panel"

export default function ResourcesPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const canUpload = user?.role === Role.INSTRUCTOR || user?.role === Role.ADMIN

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Resources</h1>
        <p className="text-muted-foreground">Access course materials and downloads</p>
      </div>
      {canUpload ? (
        <div className="mb-10">
          <ResourceManagePanel />
        </div>
      ) : null}
      <ResourceList />
    </div>
  )
}
