import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Reset password"
      subtitle="Password reset via SMS is coming soon (Stage 1c)."
      footer={
        <>
          Remember your password?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary transition-colors hover:text-[#5ac2b8] hover:underline"
          >
            Back to login
          </Link>
        </>
      }
    >
      <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        Contact support if you need help accessing your account.
      </p>
    </AuthShell>
  )
}
