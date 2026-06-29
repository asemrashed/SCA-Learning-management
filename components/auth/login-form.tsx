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
import { homePathForRole, resolvePostLoginRedirect } from '@/lib/dashboard-nav'
import { debugAgentLog } from '@/lib/debug-agent-log'

const e164Phone = z
  .string()
  .trim()
  .regex(/^\+8801[3-9]\d{8}$/, 'Use BD format: +8801XXXXXXXXX')

const loginSchema = z.object({
  phone: e164Phone,
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '+880', remember: false },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null)
    try {
      const result = await login({ phone: values.phone, password: values.password }).unwrap()
      dispatch(setCredentials({ accessToken: result.data.accessToken, user: result.data.user }))
      setSessionCookie(result.data.user.role)
      const nextParam = searchParams.get('next')
      const roleHome = homePathForRole(result.data.user.role)
      const next = resolvePostLoginRedirect(result.data.user.role, nextParam)
      // #region agent log
      debugAgentLog(
        'login-form.tsx:onSubmit',
        'post-login redirect decision',
        {
          apiRole: result.data.user.role,
          nextParam,
          roleHome,
          finalRedirect: next,
          usedNextParam: Boolean(nextParam),
          overrodeNextParam: Boolean(nextParam && nextParam !== next),
        },
        nextParam && nextParam !== next ? 'B' : 'A',
        'post-fix',
      )
      // #endregion
      router.push(next)
      router.refresh()
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: { message?: string } }; status?: number }
      setErrorMessage(
        apiErr.data?.error?.message ??
          (apiErr.status === 403
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
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-secondary">
            WhatsApp number
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+8801712345678"
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
