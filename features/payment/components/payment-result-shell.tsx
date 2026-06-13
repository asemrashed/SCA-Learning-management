"use client"

import Link from "next/link"
import { BRAND_SHORT } from "@/lib/brand"

export function PaymentResultShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <p className="mb-2 text-sm font-medium text-muted-foreground">{BRAND_SHORT}</p>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
        {children ? <div className="mt-6 space-y-3">{children}</div> : null}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/dashboard" className="underline underline-offset-4 hover:text-foreground">
          Back to dashboard
        </Link>
      </p>
    </div>
  )
}
