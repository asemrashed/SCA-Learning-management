'use client'

import { useSearchParams } from 'next/navigation'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export function ResetPasswordPageClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')?.trim()

  if (token) {
    return <ResetPasswordForm token={token} />
  }

  return <ForgotPasswordForm />
}
