"use client"

import { use } from "react"
import { SuggestionPage } from "@/features/resource/components/suggestion-page"

export default function CourseSuggestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <SuggestionPage enrollmentId={id} />
}
