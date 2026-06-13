import { AppNotFound } from '@/components/status/app-not-found'

export default function AdminNotFound() {
  return (
    <AppNotFound
      description="This admin page doesn't exist."
      backHref="/admin"
      backLabel="Back to Admin"
    />
  )
}
