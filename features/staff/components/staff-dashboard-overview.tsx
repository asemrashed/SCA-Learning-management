"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Calendar, Layers, Plus, UserPlus, Users } from "lucide-react"
import { useSelector } from "react-redux"
import { DashboardLinkCard } from "@/components/student/dashboard-link-card"
import { StaffPageShell } from "@/components/staff/staff-page-shell"
import { useListBatchesQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"
import { useListAdminEnrollmentRequestsQuery } from "@/features/enrollment/api"
import { useListAdminOrderRequestsQuery } from "@/features/shop/api"
import { useListAdminMonthlyPaymentsQuery } from "@/features/monthly-payment/api"
import { isSuperAdmin } from "@/lib/roles"
import {
  BATCHES,
  LIVE_COURSES,
  MANAGE_COURSES,
  NEW_COURSE,
  RECORDED_COURSES,
} from "@/lib/product-vocabulary"
import { staffDashboardLinkItems } from "@/lib/dashboard-nav"
import type { RootState } from "@/store/rootReducer"
import { DeliveryMode, EnrollmentStatus, MonthlyPaymentStatus, OrderStatus } from "@/types/api"
import { cn } from "@/lib/utils"

interface StaffDashboardOverviewProps {
  variant: "admin" | "super-admin"
}

const linkCardStyles = [
  { className: "bg-sky-100", iconClassName: "text-blue-700", titleClassName: "text-blue-700" },
  { className: "bg-violet-100", iconClassName: "text-violet-700", titleClassName: "text-violet-700" },
  { className: "bg-pink-100", iconClassName: "text-pink-600", titleClassName: "text-pink-600" },
  { className: "bg-amber-100", iconClassName: "text-amber-700", titleClassName: "text-amber-700" },
  { className: "bg-emerald-100", iconClassName: "text-emerald-700", titleClassName: "text-emerald-700" },
  { className: "bg-orange-100", iconClassName: "text-orange-700", titleClassName: "text-orange-700" },
  { className: "bg-cyan-100", iconClassName: "text-cyan-700", titleClassName: "text-cyan-700" },
  { className: "bg-rose-100", iconClassName: "text-rose-700", titleClassName: "text-rose-700" },
  { className: "bg-indigo-100", iconClassName: "text-indigo-700", titleClassName: "text-indigo-700" },
  { className: "bg-lime-100", iconClassName: "text-lime-700", titleClassName: "text-lime-700" },
  { className: "bg-fuchsia-100", iconClassName: "text-fuchsia-700", titleClassName: "text-fuchsia-700" },
]

function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
}: {
  icon: LucideIcon
  label: string
  value: number | undefined
  isLoading: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <Icon className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-foreground">{isLoading ? "…" : (value ?? 0)}</p>
    </div>
  )
}

function ActionListCard({
  href,
  children,
  primary = false,
  icon: Icon,
}: {
  href: string
  children: React.ReactNode
  primary?: boolean
  icon?: LucideIcon
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
        primary
          ? "border-primary bg-primary text-secondary hover:bg-primary/90"
          : "border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span className="truncate">{children}</span>
    </Link>
  )
}

function ActionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

export function StaffDashboardOverview({ variant }: StaffDashboardOverviewProps) {
  const user = useSelector((state: RootState) => state.auth.user)
  const canManagePlatform = user?.role !== undefined && isSuperAdmin(user.role)
  const linkItems = staffDashboardLinkItems(variant)

  const { data: liveCoursesData, isLoading: liveCoursesLoading } = useListCoursesQuery({
    deliveryMode: DeliveryMode.LIVE,
    pageSize: 1,
  })
  const { data: recordedCoursesData, isLoading: recordedCoursesLoading } = useListCoursesQuery({
    deliveryMode: DeliveryMode.RECORDED,
    pageSize: 1,
  })
  const { data: batchesData, isLoading: batchesLoading } = useListBatchesQuery({ pageSize: 1 })
  const { data: activeEnrollmentsData, isLoading: activeEnrollmentsLoading } =
    useListAdminEnrollmentRequestsQuery({ status: EnrollmentStatus.ACTIVE })
  const { data: completedEnrollmentsData, isLoading: completedEnrollmentsLoading } =
    useListAdminEnrollmentRequestsQuery({ status: EnrollmentStatus.COMPLETED })
  const { data: ordersData } = useListAdminOrderRequestsQuery({
    status: OrderStatus.PENDING,
  })
  const { data: paymentsData } = useListAdminMonthlyPaymentsQuery({
    status: MonthlyPaymentStatus.REQUESTED,
    pageSize: 1,
  })

  const liveCourseTotal = liveCoursesData?.meta.total ?? 0
  const recordedCourseTotal = recordedCoursesData?.meta.total ?? 0
  const batchTotal = batchesData?.meta.total ?? 0
  const enrolledTotal =
    (activeEnrollmentsData?.data?.length ?? 0) + (completedEnrollmentsData?.data?.length ?? 0)
  const enrollmentsLoading = activeEnrollmentsLoading || completedEnrollmentsLoading
  const pendingOrders = ordersData?.data?.length ?? 0
  const pendingPayments = paymentsData?.meta.total ?? 0

  const pageTitle = variant === "super-admin" ? "Super Admin Dashboard" : "Admin Dashboard"

  return (
    <StaffPageShell title={pageTitle}>
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Layers}
          label={LIVE_COURSES}
          value={liveCourseTotal}
          isLoading={liveCoursesLoading}
        />
        <StatCard
          icon={Layers}
          label={RECORDED_COURSES}
          value={recordedCourseTotal}
          isLoading={recordedCoursesLoading}
        />
        <StatCard
          icon={Calendar}
          label={BATCHES}
          value={batchTotal}
          isLoading={batchesLoading}
        />
        <StatCard
          icon={UserPlus}
          label="Enrolled students"
          value={enrolledTotal}
          isLoading={enrollmentsLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3 xl:grid-cols-3">
          {linkItems.map((item, index) => {
            const style = linkCardStyles[index % linkCardStyles.length]
            return (
              <DashboardLinkCard
                key={item.href}
                href={item.href}
                title={item.label}
                icon={item.icon}
                className={style.className}
                iconClassName={style.iconClassName}
                titleClassName={style.titleClassName}
                delay={index * 0.05}
              />
            )
          })}
        </div>

        <div className="space-y-6 lg:col-span-1">
          <ActionGroup title="Platform">
            {canManagePlatform ? (
              <ActionListCard href="/admin/courses/new" primary icon={Plus}>
                {NEW_COURSE}
              </ActionListCard>
            ) : null}
            <ActionListCard href="/admin/courses">{MANAGE_COURSES}</ActionListCard>
            {canManagePlatform ? (
              <ActionListCard href="/super-admin/users" icon={Users}>
                Manage admins
              </ActionListCard>
            ) : null}
          </ActionGroup>

          <ActionGroup title="Payments">
            <ActionListCard href="/admin/payments" primary={pendingPayments > 0}>
              Review payments{pendingPayments > 0 ? ` (${pendingPayments})` : ""}
            </ActionListCard>
          </ActionGroup>

          <ActionGroup title="Shop">
            <ActionListCard href="/admin/products/new" primary icon={Plus}>
              Add product
            </ActionListCard>
            <ActionListCard href="/admin/products">Manage products</ActionListCard>
            <ActionListCard href="/admin/orders" primary={pendingOrders > 0}>
              Review orders{pendingOrders > 0 ? ` (${pendingOrders})` : ""}
            </ActionListCard>
          </ActionGroup>
        </div>
      </div>
    </StaffPageShell>
  )
}
