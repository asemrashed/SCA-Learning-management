import { StaffShell } from "@/components/staff-shell"
import { RoleGuard } from "@/components/role-guard"
import { Role } from "@/types/api"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allow={[Role.ADMIN, Role.SUPER_ADMIN]}>
      <StaffShell>{children}</StaffShell>
    </RoleGuard>
  )
}
