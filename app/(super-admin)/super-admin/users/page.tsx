import { AdminUsersPanel } from "@/features/admin-user/components/admin-users-panel"

export default function SuperAdminUsersPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Admin accounts</h1>
        <p className="mt-2 text-muted-foreground">
          Create staff admins and activate or deactivate their access.
        </p>
      </div>
      <AdminUsersPanel />
    </div>
  )
}
