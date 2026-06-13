import { AppNotFound } from '@/components/status/app-not-found'

export default function AuthNotFound() {
  return (
    <AppNotFound
      description="This auth page doesn't exist."
      backHref="/login"
      backLabel="Back to Login"
    />
  )
}
