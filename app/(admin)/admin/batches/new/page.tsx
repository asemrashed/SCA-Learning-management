"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { isSuperAdmin } from "@/lib/roles"
import { BatchAdminForm } from "@/features/batch/components/batch-admin-form"

export default function NewBatchPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>
}) {
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)
  const params = use(searchParams)
  const courseId = params.courseId

  useEffect(() => {
    if (!courseId) {
      router.replace("/admin/courses")
      return
    }
    if (user && !isSuperAdmin(user.role)) {
      router.replace("/admin/batches")
    }
  }, [user, router, courseId])

  if (!courseId) {
    return <p className="p-8 text-muted-foreground">Select a live course first…</p>
  }

  if (!user || !isSuperAdmin(user.role)) {
    return <p className="p-8 text-muted-foreground">Checking access…</p>
  }

  return (
    <div className="px-4 py-10">
      <BatchAdminForm courseId={courseId} />
    </div>
  )
}
