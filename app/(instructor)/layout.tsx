import { AppShell } from "@/components/app-shell"

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell variant="instructor">{children}</AppShell>
}
