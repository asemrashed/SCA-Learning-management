"use client"

import Image from "next/image"
import { Shield, User } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/rootReducer"
import { Role } from "@/types/api"

function roleLabel(role: Role | undefined): string {
  if (role === Role.SUPER_ADMIN) return "Super Admin"
  if (role === Role.ADMIN) return "Admin"
  return "Staff"
}

export function StaffHeader() {
  const user = useSelector((state: RootState) => state.auth.user)
  const displayName = user?.name ?? "Staff"

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
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{roleLabel(user?.role)}</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
