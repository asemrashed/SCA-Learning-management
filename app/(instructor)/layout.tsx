import { AppShell } from "@/components/app-shell"
import { RoleGuard } from "@/components/role-guard"
import { Role } from "@/types/api"

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allow={[Role.INSTRUCTOR]}>
      <AppShell variant="instructor">{children}</AppShell>
    </RoleGuard>
  )
}
