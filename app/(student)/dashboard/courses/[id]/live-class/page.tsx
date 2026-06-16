"use client"

import { use } from "react"
import { LiveClassPage } from "@/features/enrollment/components/live-class-page"

export default function LiveClassLinkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <LiveClassPage enrollmentId={id} />
}
