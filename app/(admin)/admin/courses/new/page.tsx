"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { isSuperAdmin } from "@/lib/roles"
import { CourseAdminForm } from "@/features/course/components/course-admin-form"

export default function AdminNewCoursePage() {
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)

  useEffect(() => {
    if (user && !isSuperAdmin(user.role)) {
      router.replace("/admin/courses")
    }
  }, [user, router])

  if (!user || !isSuperAdmin(user.role)) {
    return <p className="p-8 text-muted-foreground">Checking access…</p>
  }

  return (
    <div className="px-4 py-10">
      <CourseAdminForm />
    </div>
  )
}
