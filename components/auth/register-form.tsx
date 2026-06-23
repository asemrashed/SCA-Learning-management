'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch } from 'react-redux'
import { AuthShell } from '@/components/auth/auth-shell'
import { PasswordInput } from '@/components/auth/password-input'
import { useRegisterMutation } from '@/features/auth/api'
import { setCredentials } from '@/features/auth/authSlice'
import { setSessionCookie } from '@/lib/auth-session'

const e164Phone = z
  .string()
  .trim()
  .regex(/^\+8801[3-9]\d{8}$/, 'Use BD format: +8801XXXXXXXXX')

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    phone: e164Phone,
    password: z.string().trim().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [registerUser, { isLoading }] = useRegisterMutation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { phone: '+880' },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setErrorMessage(null)
    try {
      const result = await registerUser({
        name: values.name,
        phone: values.phone,
        password: values.password,
      }).unwrap()
      dispatch(setCredentials({ accessToken: result.data.accessToken, user: result.data.user }))
      setSessionCookie()
      router.push('/dashboard')
      router.refresh()
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
          : 'Registration failed. This phone may already be registered.'
      setErrorMessage(message)
    }
  }

  return (
    <AuthShell
      title="Register"
      subtitle="Create your student account with phone and password."
      footer={
        <>
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary transition-colors hover:text-[#5ac2b8] hover:underline"
          >
            Login here
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold text-secondary">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-secondary placeholder:text-gray-400 transition-all duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            {...register('name')}
          />
          {errors.name && <p className="mt-1.5 text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-secondary">
            Phone number
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1.5 text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-secondary">
            Confirm password
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
          {isLoading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  )
}
