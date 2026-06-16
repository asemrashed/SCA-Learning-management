import { headers } from "next/headers"
import { AppShell } from "@/components/app-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const clientIp =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    undefined

  return (
    <AppShell variant="student" clientIp={clientIp}>
      {children}
    </AppShell>
  )
}
