"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { isStaff } from "@/lib/roles"
import { ResourceList } from "@/features/resource/components/resource-list"
import { ResourceManagePanel } from "@/features/resource/components/resource-manage-panel"
import { StudentPageShell } from "@/components/student/student-page-shell"

export default function ResourcesPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const canUpload = user?.role !== undefined && isStaff(user.role)

  return (
    <StudentPageShell title="Resources">
      {canUpload ? (
        <div className="mb-10">
          <ResourceManagePanel />
        </div>
      ) : null}
      <ResourceList />
    </StudentPageShell>
  )
}
