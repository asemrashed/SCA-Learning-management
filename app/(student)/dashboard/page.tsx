"use client"

import { BookOpen, ShoppingCart, User } from "lucide-react"
import { useSelector } from "react-redux"
import { DEMO_STUDENT_NAME } from "@/lib/brand"
import type { RootState } from "@/store/rootReducer"
import { useListEnrollmentsQuery } from "@/features/enrollment/api"
import { useListOrdersQuery } from "@/features/shop/api"
import { useAuthQuerySkip } from "@/features/auth/hooks"
import { EnrollmentStatus } from "@/types/api"
import { DashboardLinkCard } from "@/components/student/dashboard-link-card"
import { StudentPageShell } from "@/components/student/student-page-shell"

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const displayName = user?.name?.split(" ")[0] ?? DEMO_STUDENT_NAME
  const skipAuth = useAuthQuerySkip()

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useListEnrollmentsQuery(
    undefined,
    { skip: skipAuth },
  )
  const { data: ordersData, isLoading: ordersLoading } = useListOrdersQuery(undefined, {
    skip: skipAuth,
  })

  const courseCount = (enrollmentsData?.data ?? []).filter(
    (e) =>
      e.status === EnrollmentStatus.ACTIVE ||
      e.status === EnrollmentStatus.COMPLETED ||
      e.status === EnrollmentStatus.PENDING,
  ).length

  const orderCount = ordersData?.data?.length ?? 0

  return (
    <StudentPageShell title="My Dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Welcome back, {displayName}!
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <DashboardLinkCard
          href="/dashboard/orders"
          title="My Orders"
          count={ordersLoading ? undefined : orderCount}
          icon={ShoppingCart}
          className="bg-sky-100"
          iconClassName="text-blue-700"
          titleClassName="text-blue-700"
          delay={0}
        />
        <DashboardLinkCard
          href="/dashboard/courses"
          title="My Courses"
          count={enrollmentsLoading ? undefined : courseCount}
          icon={BookOpen}
          className="bg-violet-100"
          iconClassName="text-violet-700"
          titleClassName="text-violet-700"
          delay={0.08}
        />
        <DashboardLinkCard
          href="/dashboard/profile"
          title="My Profile"
          icon={User}
          className="bg-pink-100"
          iconClassName="text-pink-600"
          titleClassName="text-pink-600"
          delay={0.16}
        />
      </div>
    </StudentPageShell>
  )
}
