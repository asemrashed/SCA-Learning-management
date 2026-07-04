'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthShell } from '@/components/auth/auth-shell'
import { useRequestPasswordResetMutation } from '@/features/auth/api'
import { BRAND_SHORT } from '@/lib/brand'

const forgotSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
})

type ForgotFormValues = z.infer<typeof forgotSchema>

export function ForgotPasswordForm() {
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation()
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (values: ForgotFormValues) => {
    setErrorMessage(null)
    try {
      await requestReset({ email: values.email.trim().toLowerCase() }).unwrap()
      setSubmitted(true)
    } catch {
      setErrorMessage('Something went wrong. Please try again in a moment.')
    }
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle={`Enter the email on your ${BRAND_SHORT} account and we will send you a secure reset link.`}
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
      {submitted ? (
        <div className="space-y-4">
          <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-secondary">
            If an account exists for that email, a password reset link has been sent. Check your inbox
            and spam folder. The link expires after a short time.
          </p>
          <Link
            href="/login"
            className="inline-block text-sm font-semibold text-primary transition-colors hover:text-[#5ac2b8] hover:underline"
          >
            Return to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-secondary">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-secondary placeholder:text-gray-400 transition-all duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary px-4 py-3.5 font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#5ac2b8] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60"
          >
            {isLoading ? 'Sending link…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
