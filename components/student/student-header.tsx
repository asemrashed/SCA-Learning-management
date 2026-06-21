"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { User } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"
import { formatStudentId } from "@/lib/student-id"
import { useListEnrollmentsQuery } from "@/features/enrollment/api"
import { useAuthQuerySkip } from "@/features/auth/hooks"

interface StudentHeaderProps {
  clientIp?: string
}

export function StudentHeader({ clientIp }: StudentHeaderProps) {
  const [mounted, setMounted] = useState(false)
  const user = useSelector((state: RootState) => state.auth.user)
  const skipAuth = useAuthQuerySkip()
  const { data } = useListEnrollmentsQuery(undefined, { skip: skipAuth })

  useEffect(() => {
    setMounted(true)
  }, [])

  const rollNumber = data?.data?.find((e) => e.rollNumber)?.rollNumber ?? null
  const studentId = user ? formatStudentId(rollNumber, user.id) : "—"
  const displayName = mounted ? (user?.name ?? "Student") : "Student"
  const studentIdDisplay = mounted ? studentId : "—"

  return (
    <header className="border-b border-white/10 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-500 px-4 py-4 shadow-md md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-sky-300 bg-sky-100">
            {user?.avatarUrl ? (
              <Image src={user.avatarUrl} alt={displayName} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-7 w-7 text-sky-600" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-white md:text-xl">{displayName}</h1>
            <p className="flex items-center gap-1.5 text-sm text-white/90">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{studentIdDisplay}</span>
            </p>
          </div>
        </div>
        {clientIp ? (
          <p className="hidden shrink-0 text-xs text-white/80 sm:block">
            IP Address : {clientIp}
          </p>
        ) : null}
      </div>
    </header>
  )
}
