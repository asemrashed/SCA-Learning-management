'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthShell } from '@/components/auth/auth-shell'
import { PasswordInput } from '@/components/auth/password-input'
import { useResetPasswordMutation } from '@/features/auth/api'
import { BRAND_SHORT } from '@/lib/brand'

const resetSchema = z
  .object({
    newPassword: z.string().trim().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetFormValues = z.infer<typeof resetSchema>

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter()
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (values: ResetFormValues) => {
    setErrorMessage(null)
    try {
      await resetPassword({
        token,
        newPassword: values.newPassword,
      }).unwrap()
      router.replace('/login?reset=success')
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === 'object' &&
        'data' in err &&
        err.data &&
        typeof err.data === 'object' &&
        'error' in err.data &&
        err.data.error &&
        typeof err.data.error === 'object' &&
        'message' in err.data.error &&
        typeof err.data.error.message === 'string'
          ? err.data.error.message
          : 'This reset link is invalid or has expired. Please request a new one.'
      setErrorMessage(message)
    }
  }

  return (
    <AuthShell
      title="Set new password"
      subtitle={`Choose a new password for your ${BRAND_SHORT} account.`}
      footer={
        <>
          Need a new link?{' '}
          <Link
            href="/reset"
            className="font-semibold text-primary transition-colors hover:text-[#5ac2b8] hover:underline"
          >
            Request again
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="newPassword" className="mb-2 block text-sm font-semibold text-secondary">
            New password
          </label>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...register('newPassword')}
          />
          {errors.newPassword && (
            <p className="mt-1.5 text-sm text-destructive">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-secondary">
            Confirm new password
          </label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-sm text-destructive">{errors.confirmPassword.message}</p>
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
          {isLoading ? 'Updating password…' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  )
}
