import { Suspense } from 'react'
import { ResetPasswordPageClient } from '@/components/auth/reset-password-page-client'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageClient />
    </Suspense>
  )
}
