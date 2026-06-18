"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { isAdminStaff } from "@/lib/roles"
import { BatchAdminForm } from "@/features/batch/components/batch-admin-form"

export default function NewCourseBatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)
  const { id: courseId } = use(params)

  useEffect(() => {
    if (user && !isAdminStaff(user.role)) {
      router.replace("/admin/batches")
    }
  }, [user, router])

  if (!user || !isAdminStaff(user.role)) {
    return <p className="p-8 text-muted-foreground">Checking access...</p>
  }

  return (
    <div className="px-4 py-10">
      <BatchAdminForm courseId={courseId} />
    </div>
  )
}
