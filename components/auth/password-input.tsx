'use client'

import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ id, className, ...props }, ref) {
    const [visible, setVisible] = useState(false)

    return (
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          className={cn(
            'w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-secondary placeholder:text-gray-400 transition-all duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary',
            className,
          )}
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 transition-colors hover:text-primary focus:outline-none"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    )
  },
)
