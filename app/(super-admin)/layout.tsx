import { AppShell } from "@/components/app-shell"
import { RoleGuard } from "@/components/role-guard"
import { Role } from "@/types/api"

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allow={[Role.SUPER_ADMIN]}>
      <AppShell variant="super-admin">{children}</AppShell>
    </RoleGuard>
  )
}
