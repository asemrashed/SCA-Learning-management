'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch } from 'react-redux'
import { AuthShell } from '@/components/auth/auth-shell'
import { PasswordInput } from '@/components/auth/password-input'
import { useLoginMutation } from '@/features/auth/api'
import { setCredentials } from '@/features/auth/authSlice'
import { setSessionCookie } from '@/lib/auth-session'
import { resolvePostLoginRedirect } from '@/lib/dashboard-nav'
import { isBdE164Phone, normalizeBdPhone } from '@/lib/phone'

const bdPhone = z
  .string()
  .trim()
  .min(1, 'WhatsApp number is required')
  .refine((val) => isBdE164Phone(normalizeBdPhone(val)), 'Enter a valid BD mobile (01XXXXXXXXX)')

const loginSchema = z.object({
  phone: bdPhone,
  password: z.string().trim().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()
  const [login, { isLoading }] = useLoginMutation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const resetSuccess = searchParams.get('reset') === 'success'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '', remember: false },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null)
    try {
      const remember = values.remember === true
      const result = await login({
        phone: normalizeBdPhone(values.phone),
        password: values.password,
        remember,
      }).unwrap()
      dispatch(setCredentials({ accessToken: result.data.accessToken, user: result.data.user }))
      setSessionCookie(result.data.user.role, { remember })
      const nextParam = searchParams.get('next')
      const next = resolvePostLoginRedirect(result.data.user.role, nextParam)
      router.replace(next)
    } catch (err: unknown) {
      const apiErr = err as {
        data?: { error?: { code?: string; message?: string } }
        status?: number
      }
      const code = apiErr.data?.error?.code
      setErrorMessage(
        apiErr.data?.error?.message ??
          (code === 'DEVICE_BOUND_OTHER'
            ? 'This account is locked to another device. Ask an admin to remove the old device.'
            : apiErr.status === 403
              ? 'This account cannot sign in.'
              : 'Invalid WhatsApp number or password. Please try again.'),
      )
    }
  }

  return (
    <AuthShell
      title="Login"
      subtitle="Enter your WhatsApp number and password to sign in."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-primary transition-colors hover:text-[#5ac2b8] hover:underline"
          >
            Register here
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {resetSuccess && (
          <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-secondary">
            Your password has been updated. Sign in with your new password.
          </p>
        )}

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-secondary">
            WhatsApp number
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-secondary placeholder:text-gray-400 transition-all duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            {...register('phone')}
          />
          {errors.phone && <p className="mt-1.5 text-sm text-destructive">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold text-secondary">
            Password
          </label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1.5 text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="group flex cursor-pointer items-center space-x-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary shadow-sm transition-colors focus:ring-primary focus:ring-opacity-50"
              {...register('remember')}
            />
            <span className="text-gray-600 transition-colors group-hover:text-secondary">Remember me</span>
          </label>
          <Link
            href="/reset"
            className="font-medium text-primary transition-colors hover:text-[#5ac2b8] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {errorMessage && (
          <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary px-4 py-3.5 font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#5ac2b8] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60"
        >
          {isLoading ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </AuthShell>
  )
}
