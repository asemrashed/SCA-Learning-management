import { Suspense } from 'react'
import { AuthSessionRedirect } from '@/components/auth/auth-session-redirect'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthSessionRedirect />
      <LoginForm />
    </Suspense>
  )
}
