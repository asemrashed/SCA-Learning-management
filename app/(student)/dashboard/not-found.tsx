import { AppNotFound } from '@/components/status/app-not-found'

export default function DashboardNotFound() {
  return (
    <AppNotFound
      description="This dashboard page doesn't exist or you may not have access."
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  )
}
